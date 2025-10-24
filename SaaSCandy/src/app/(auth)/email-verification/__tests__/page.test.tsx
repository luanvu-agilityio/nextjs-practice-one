import { render, screen, waitFor } from '@testing-library/react';
import VerifyEmailPage from '@/app/(auth)/email-verification/page';

// Mock the VerifyEmailContent component
jest.mock('@/components/pages/VerifyEmailContent', () => ({
  VerifyEmailContent: () => {
    return <div data-testid='verify-email-content'>Verify Email Content</div>;
  },
}));

describe('VerifyEmailPage - Interactive Tests', () => {
  it('should render VerifyEmailContent after suspense resolves', async () => {
    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('verify-email-content')).toBeInTheDocument();
    });
  });
});
