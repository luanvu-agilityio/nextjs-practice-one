import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '../index';
import { showToast } from '@/components/common/Toast';

jest.mock('@/components/common/Toast', () => ({
  showToast: jest.fn(),
}));

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    control: {},
    handleSubmit:
      (fn: (data: { email: string }) => void) => (e: React.FormEvent) => {
        e.preventDefault();
        fn({ email: 'test@example.com' });
      },
    formState: { errors: {} },
  }),
}));

jest.mock('@/components/common/ErrorMessage', () => ({
  ErrorMessage: ({ error }: { error?: string }) => (
    <div data-testid='error-message'>{error}</div>
  ),
}));

jest.mock('@/components/common', () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
  InputController: ({ name, label }: { name: string; label: string }) => (
    <input data-testid={name} aria-label={label} />
  ),
}));

const mockShowToast = showToast as jest.MockedFunction<typeof showToast>;

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should render without crashing', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByTestId('email')).toBeInTheDocument();
  });

  it('should render email input field', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<ForgotPasswordForm />);
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it('should successfully send reset email', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true }),
    });

    render(<ForgotPasswordForm />);

    const form = screen.getByRole('button').closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/send-reset-password',
        {
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Email Sent',
        description: 'Check your inbox',
        variant: 'success',
      });
    });
  });

  it('should display error toast when request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: false, message: 'Email not found' }),
    });

    render(<ForgotPasswordForm />);

    const form = screen.getByRole('button').closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Email not found',
        variant: 'error',
      });
    });
  });
});
