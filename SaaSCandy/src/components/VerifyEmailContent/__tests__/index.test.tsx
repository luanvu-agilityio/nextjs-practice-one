import { render, waitFor } from '@testing-library/react';

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
  });
});
