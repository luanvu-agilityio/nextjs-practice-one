import React from 'react';
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from '@testing-library/react';

// Create mutable mocks that the jest.mock factories will reference. This
// allows individual tests to change behavior (for example, make the
// searchParams.get return null) without re-importing the module.
const mockPush = jest.fn();
const mockGet = jest.fn<string | null, []>(() => 'valid-token');

// Hoist module mocks so the component under test receives them at import time.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: () => mockGet(),
  }),
}));

const mockVerifyEmail = jest.fn();
jest.mock('@/service', () => ({
  verifyEmail: (...args: unknown[]) => mockVerifyEmail(...(args as [])),
}));

// Import after mocks so the module uses the mocked implementations.
import { VerifyEmailContent } from '../index';

beforeEach(() => {
  jest.clearAllMocks();
  // Use fake timers for the redirect setTimeout so we can assert it fires.
  jest.useFakeTimers();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('VerifyEmailContent Component', () => {
  it('matches snapshot in verifying state', () => {
    const { container } = render(<VerifyEmailContent />);
    expect(container).toMatchSnapshot();
  });

  it('displays success message on successful verification and redirects', async () => {
    // Arrange: make verifyEmail resolve successfully (configure the internal mock)
    mockVerifyEmail.mockResolvedValue({ success: true });

    // Act
    const { getByText } = render(<VerifyEmailContent />);

    // Assert: success UI appears
    await waitFor(() => {
      expect(getByText('Email Verified!')).toBeInTheDocument();
    });

    // Advance timers to trigger the component's setTimeout redirect
    await act(async () => {
      jest.runAllTimers();
    });

    // The mockPush should have been called due to the redirect
    expect(mockPush).toHaveBeenCalled();
  });

  it('displays error message on failed verification', async () => {
    mockVerifyEmail.mockResolvedValue({
      success: false,
      error: 'Invalid token',
    });

    const { getByText } = render(<VerifyEmailContent />);

    await waitFor(() => {
      expect(getByText('Verification Failed')).toBeInTheDocument();
    });

    // use findByText which waits for the element to appear
    await screen.findByText('Verification Failed');
  });

  it('displays error when no token is provided', async () => {
    // Make the search param getter return null for this test
    mockGet.mockReturnValueOnce(null);

    const { getByText } = render(<VerifyEmailContent />);

    await waitFor(() => {
      expect(getByText('Verification Failed')).toBeInTheDocument();
    });

    // use findByText which waits for the element to appear
    await screen.findByText('Verification Failed');
  });

  it("throws when verifyEmail returns success:false without an error message", async () => {
    // Arrange: verifyEmail resolves to { success: false } (no error field)
    mockVerifyEmail.mockResolvedValueOnce({ success: false });

    // Act
    render(<VerifyEmailContent />);

    // Assert: component shows failure UI (caught error path)
    await screen.findByText('Verification Failed');

    expect(mockVerifyEmail).toHaveBeenCalled();
    // confirm the catch logged the error
    expect((console.error as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    const firstCall = (console.error as jest.Mock).mock.calls[0];
    expect(firstCall[0]).toContain('Email verification error:');
  });

  it('error state buttons navigate to signup and signin', async () => {
    // Arrange: make verifyEmail fail so error UI (with action buttons) renders
    mockVerifyEmail.mockResolvedValueOnce({ success: false, error: 'err' });

    render(<VerifyEmailContent />);

    await waitFor(() =>
      expect(screen.getByText('Verification Failed')).toBeInTheDocument()
    );

    // Click Request New Verification Email -> should navigate to SIGN_UP
    fireEvent.click(
      screen.getByRole('button', { name: /request new verification email/i })
    );
    expect(mockPush).toHaveBeenCalledWith('/signup');

    // Click Back to Sign In -> should navigate to SIGN_IN
    fireEvent.click(screen.getByRole('button', { name: /back to sign in/i }));
    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('logs error when verifyEmail returns success:false (covers throw path)', async () => {
    // Arrange: make verifyEmail resolve to a failure object
    mockVerifyEmail.mockResolvedValueOnce({ success: false, error: 'BOOM' });

    render(<VerifyEmailContent />);

    // Wait for the error UI to render which indicates the thrown error was caught
    await screen.findByText('Verification Failed');

    // The internal mock should have been called
    expect(mockVerifyEmail).toHaveBeenCalled();

    // console.error should have been called with the thrown error (caught in catch)
    // The spy in beforeEach records calls even though it's no-op.
    expect((console.error as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    const firstCall = (console.error as jest.Mock).mock.calls[0];
    expect(firstCall[0]).toContain('Email verification error:');
    // second arg should be the Error instance or message
    expect(String(firstCall[1])).toContain('BOOM');
  });
});
