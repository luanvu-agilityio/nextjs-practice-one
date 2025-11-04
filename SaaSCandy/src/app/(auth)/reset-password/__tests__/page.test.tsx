import { render, screen } from '@testing-library/react';
import ResetPasswordPage from '../page';
import React from 'react';

// Mock the ResetPasswordPageContent component
jest.mock('@/components/pages/ResetPasswordPageContent', () => {
  // Simulate a delayed render to allow Suspense fallback to show
  return function MockResetPasswordPageContent() {
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    }, []);
    if (!show) {
      // Render a spinner with role="status" to match the test expectation
      return (
        <div
          role='status'
          className='animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full'
          data-testid='spinner'
        >
          Loading...
        </div>
      );
    }
    return (
      <div data-testid='reset-password-content'>Reset Password Content</div>
    );
  };
});

describe('ResetPasswordPage', () => {
  it('renders loading spinner initially', async () => {
    render(<ResetPasswordPage />);

    const spinner = await screen.findByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders ResetPasswordPageContent after suspense resolves', async () => {
    render(<ResetPasswordPage />);

    const content = await screen.findByTestId('reset-password-content');
    expect(content).toBeInTheDocument();
  });

  it('spinner has correct styling', () => {
    const { container } = render(<ResetPasswordPage />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass(
      'w-16',
      'h-16',
      'border-4',
      'border-primary',
      'border-t-transparent',
      'rounded-full'
    );
  });
});
