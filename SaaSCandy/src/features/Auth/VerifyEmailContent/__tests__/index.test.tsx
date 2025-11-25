import { render, waitFor } from '@testing-library/react';

jest.mock('@/service', () => ({
  __esModule: true,
  runAuthEffect: jest.fn(),
  verifyEmail: jest.fn((t: unknown) => t),
}));

jest.mock('@/service/AuthService/helpers', () => ({
  __esModule: true,
  runAuthEffect: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => 'valid-token'),
  })),
}));

import * as service from '@/service';
import * as helpers from '@/service/AuthService/helpers';
import { VerifyEmailContent } from '../index';

beforeEach(() => {
  jest.clearAllMocks();
  // Suppress console.error during tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
  // Keep the default runAuthEffect as a pending promise so the
  // component stays in the 'verifying' state for snapshot tests.
  const pending = () => new Promise(() => {});
  if ((service.runAuthEffect as jest.Mock).mock) {
    (service.runAuthEffect as jest.Mock).mockImplementation(pending);
  }
  if ((helpers.runAuthEffect as jest.Mock).mock) {
    (helpers.runAuthEffect as jest.Mock).mockImplementation(pending);
  }
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

  it('displays success message on successful verification', async () => {
    (helpers.runAuthEffect as jest.Mock).mockResolvedValue({ success: true });

    const { getByText } = render(<VerifyEmailContent />);

    // Ensure the mocked helper was invoked and the Promise resolves
    await waitFor(() => {
      expect(
        (helpers.runAuthEffect as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(getByText('Email Verified!')).toBeInTheDocument();
    });
  });

  it('displays error message on failed verification', async () => {
    (helpers.runAuthEffect as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Invalid token',
    });

    const { getByText } = render(<VerifyEmailContent />);

    await waitFor(() => {
      expect(getByText('Verification Failed')).toBeInTheDocument();
    });
  });

  it('displays error when no token is provided', async () => {
    // Override the search params mock to simulate no token present
    const nav = await import('next/navigation');
    (nav.useSearchParams as jest.Mock).mockImplementation(() => ({
      get: jest.fn(() => null),
    }));

    const { getByText } = render(<VerifyEmailContent />);

    await waitFor(() => {
      expect(getByText('Verification Failed')).toBeInTheDocument();
    });
  });
});
