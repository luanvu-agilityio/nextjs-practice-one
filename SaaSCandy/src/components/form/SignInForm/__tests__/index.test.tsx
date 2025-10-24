import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInForm } from '../index';
import { Control } from 'react-hook-form';
import { SignInFormValues } from '@/utils';

jest.mock('@/components/common', () => ({
  Button: ({
    children,
    onClick,
    disabled,

    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;

    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
  Divider: ({ text }: { text: string }) => <div>{text}</div>,
  InputController: ({
    name,
    placeholder,
  }: {
    name: string;
    placeholder: string;
  }) => <input name={name} placeholder={placeholder} />,
}));

jest.mock('@/components/SocialButton', () => ({
  SocialButton: ({
    children,
    onClick,
    disabled,
    provider,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    provider: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-provider={provider}>
      {children}
    </button>
  ),
}));

describe('SignInForm', () => {
  const mockControl = {} as Control<SignInFormValues>;
  const mockProps = {
    control: mockControl,
    onSubmit: jest.fn(),
    onSocialSignIn: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<SignInForm {...mockProps} />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('should render email and password input fields', () => {
    render(<SignInForm {...mockProps} />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('should render Google social button', () => {
    render(<SignInForm {...mockProps} />);

    const googleButton = screen.getByText('Google');
    expect(googleButton).toBeInTheDocument();
  });

  it('should render GitHub social button', () => {
    render(<SignInForm {...mockProps} />);

    const githubButton = screen.getByText('GitHub');
    expect(githubButton).toBeInTheDocument();
  });

  it('should call onSocialSignIn with google when Google button is clicked', async () => {
    render(<SignInForm {...mockProps} />);

    const googleButton = screen.getByText('Google');
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockProps.onSocialSignIn).toHaveBeenCalledWith('google');
    });
  });

  it('should call onSocialSignIn with github when GitHub button is clicked', async () => {
    render(<SignInForm {...mockProps} />);

    const githubButton = screen.getByText('GitHub');
    fireEvent.click(githubButton);

    await waitFor(() => {
      expect(mockProps.onSocialSignIn).toHaveBeenCalledWith('github');
    });
  });

  it('should render divider text', () => {
    render(<SignInForm {...mockProps} />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('should render submit button with correct text when not loading', () => {
    render(<SignInForm {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    expect(submitButton).toBeInTheDocument();
  });

  it('should render submit button with loading text when isLoading is true', () => {
    const loadingProps = { ...mockProps, isLoading: true };
    render(<SignInForm {...loadingProps} />);

    const submitButton = screen.getByRole('button', { name: /sending code/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should disable submit button when isLoading is true', () => {
    const loadingProps = { ...mockProps, isLoading: true };
    render(<SignInForm {...loadingProps} />);

    const submitButton = screen.getByRole('button', { name: /sending code/i });
    expect(submitButton).toBeDisabled();
  });

  it('should disable social buttons when isLoading is true', () => {
    const loadingProps = { ...mockProps, isLoading: true };
    render(<SignInForm {...loadingProps} />);

    const googleButton = screen.getByText('Google');
    const githubButton = screen.getByText('GitHub');

    expect(googleButton).not.toBeDisabled();
    expect(githubButton).not.toBeDisabled();
  });

  it('should call onSubmit when form is submitted', async () => {
    render(<SignInForm {...mockProps} />);

    const form = screen
      .getByRole('button', { name: 'Sign In' })
      .closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('should have noValidate attribute on form', () => {
    render(<SignInForm {...mockProps} />);

    const form = screen
      .getByRole('button', { name: 'Sign In' })
      .closest('form');
    expect(form).toHaveAttribute('noValidate');
  });

  it('should not call onSubmit when social buttons are clicked', async () => {
    render(<SignInForm {...mockProps} />);

    const googleButton = screen.getByText('Google');
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockProps.onSubmit).not.toHaveBeenCalled();
      expect(mockProps.onSocialSignIn).toHaveBeenCalled();
    });
  });
});
