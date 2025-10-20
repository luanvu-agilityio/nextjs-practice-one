import { ToastProvider } from '@/providers/Toast/index';
import { render, screen } from '@testing-library/react';

jest.mock('sonner', () => ({
  Toaster: () => <div data-testid='toaster'>Toaster</div>,
}));

describe('ToastProvider', () => {
  it('should render children with Toaster', () => {
    render(
      <ToastProvider>
        <div>Test Content</div>
      </ToastProvider>
    );

    expect(screen.getByTestId('toaster')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
