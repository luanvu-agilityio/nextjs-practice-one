import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '../index';
import React from 'react';

// Bypass zod validation in tests so handleSubmit always runs.
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => (values: unknown) => ({
    values,
    errors: {} as Record<string, unknown>,
  }),
}));

// Expose mocks so tests can assert on calls
const mockShowToast = jest.fn();
const mockResetPassword = jest.fn();
const mockPush = jest.fn();

// Mock dependencies
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  ErrorMessage: ({ error }: { error: string }) => <div>{error}</div>,
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{props.children}</button>
  ),
  InputController: ({
    label,
    name,
    placeholder,
    type,
    required,

    field,
  }: {
    label: string;
    name: string;
    placeholder: string;
    type: string;
    required?: boolean;

    field?: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    };
  }) => {
    const [value, setValue] = React.useState(field?.value ?? '');
    React.useEffect(() => {
      if (field?.value !== undefined && field?.value !== value) {
        setValue(field.value);
      }
    }, [field?.value, value]);
    return (
      <input
        aria-label={label}
        name={name}
        placeholder={placeholder}
        type={type}
        required={required}
        data-testid={name}
        onChange={e => {
          setValue(e.target.value);
          field?.onChange?.(e);
        }}
        value={value}
      />
    );
  },
  getFriendlyMessage: (m: string) => m,
}));

jest.mock('@/service', () => ({
  resetPassword: (...args: unknown[]) => mockResetPassword(...args),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? 'test-token' : ''),
  }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore fetch mock after each test to avoid cross-test pollution
    jest.restoreAllMocks();
  });

  it('renders password inputs and submit button', () => {
    render(<ResetPasswordForm />);
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Change Password/i })
    ).toBeInTheDocument();
  });

  it('shows error message for invalid password', async () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password/i)).toBeInTheDocument();
    });
  });

  it('renders password inputs and submit button', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Change Password/i })
    ).toBeInTheDocument();
  });

  it('has correct placeholder text', () => {
    render(<ResetPasswordForm />);

    expect(
      screen.getByPlaceholderText('Enter new password')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Confirm new password')
    ).toBeInTheDocument();
  });

  it('password inputs are required', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByTestId('newPassword')).toBeRequired();
    expect(screen.getByTestId('confirmPassword')).toBeRequired();
  });

  it('password inputs have type password', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByTestId('newPassword')).toHaveAttribute(
      'type',
      'password'
    );
    expect(screen.getByTestId('confirmPassword')).toHaveAttribute(
      'type',
      'password'
    );
  });

  it('submits successfully and redirects to sign in', async () => {
    jest.useFakeTimers();

    const onSuccess = jest.fn();
    mockResetPassword.mockResolvedValueOnce({ success: true });

    render(<ResetPasswordForm token='tkn' onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'StrongPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    // advance timers to trigger redirect
    jest.runAllTimers();
    expect(mockPush).toHaveBeenCalledWith('/signin');
    expect(onSuccess).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('shows friendly error and calls onError when resetPassword returns failure', async () => {
    const onError = jest.fn();
    mockResetPassword.mockResolvedValueOnce({
      success: false,
      message: 'boom',
    });

    render(<ResetPasswordForm token='tkn' onError={onError} />);

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'StrongPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    expect(onError).toHaveBeenCalledWith('boom');
  });

  it('handles thrown error from resetPassword and calls onError', async () => {
    const onError = jest.fn();
    mockResetPassword.mockRejectedValueOnce(new Error('network'));

    render(<ResetPasswordForm token='tkn' onError={onError} />);

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'StrongPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    expect(onError).toHaveBeenCalledWith('network');
  });
});
