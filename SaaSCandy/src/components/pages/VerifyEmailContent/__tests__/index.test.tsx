import { render, waitFor, act } from '@testing-library/react';

import { VerifyEmailContent } from '../index';
import { verifyEmail } from '@/service';

jest.mock('@/service');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => 'valid-token'),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  // Suppress console.error during tests
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

  it('displays success message on successful verification', async () => {
    (verifyEmail as jest.Mock).mockResolvedValue({ success: true });

    const { getByText } = render(<VerifyEmailContent />);

    await waitFor(() => {
      expect(getByText('Email Verified!')).toBeInTheDocument();
    });

    // Advance timers to trigger setTimeout redirect
    act(() => {
      jest.runAllTimers();
    });
  });

  it('displays error message on failed verification', async () => {
    (verifyEmail as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Invalid token',
    });

    const { getByText } = render(<VerifyEmailContent />);

    await waitFor(() => {
      expect(getByText('Verification Failed')).toBeInTheDocument();
    });
  });

  it('displays error when no token is provided', async () => {
    jest.mock('next/navigation', () => ({
      useRouter: () => ({
        push: jest.fn(),
      }),
      useSearchParams: () => ({
        get: jest.fn(() => null),
      }),
    }));

    const { getByText } = render(<VerifyEmailContent />);

    await waitFor(() => {
      expect(getByText('Verification Failed')).toBeInTheDocument();
    });
  });
});
