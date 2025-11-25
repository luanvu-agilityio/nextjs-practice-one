import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignUpForm } from '../index';
import { Control } from 'react-hook-form';
import { SignUpFormValues } from '@/utils';

jest.mock('@/components/ui', () => ({
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

jest.mock('@/components', () => ({
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

describe('SignUpForm', () => {
  const mockControl = {} as Control<SignUpFormValues>;
  const mockProps = {
    control: mockControl,
    onSubmit: jest.fn(),
    onSocialSignUp: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<SignUpForm {...mockProps} />);
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
  });

  it('should render all input fields', () => {
    render(<SignUpForm {...mockProps} />);

    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('should render Google social button', () => {
    render(<SignUpForm {...mockProps} />);

    const googleButton = screen.getByText('Google');
    expect(googleButton).toBeInTheDocument();
  });

  it('should render GitHub social button', () => {
    render(<SignUpForm {...mockProps} />);

    const githubButton = screen.getByText('GitHub');
    expect(githubButton).toBeInTheDocument();
  });

  it('should call onSocialSignUp with google when Google button is clicked', async () => {
    render(<SignUpForm {...mockProps} />);

    const googleButton = screen.getByText('Google');
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockProps.onSocialSignUp).toHaveBeenCalledWith('google');
    });
  });

  it('should call onSocialSignUp with github when GitHub button is clicked', async () => {
    render(<SignUpForm {...mockProps} />);

    const githubButton = screen.getByText('GitHub');
    fireEvent.click(githubButton);

    await waitFor(() => {
      expect(mockProps.onSocialSignUp).toHaveBeenCalledWith('github');
    });
  });

  it('should render divider text', () => {
    render(<SignUpForm {...mockProps} />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('should render submit button with correct text when not loading', () => {
    render(<SignUpForm {...mockProps} />);

    const submitButton = screen.getByRole('button', {
      name: 'Sign Up',
    });
    expect(submitButton).toBeInTheDocument();
  });

  it('should render submit button with loading text when isLoading is true', () => {
    const loadingProps = { ...mockProps, isLoading: true };
    render(<SignUpForm {...loadingProps} />);

    const submitButton = screen.getByRole('button', {
      name: /creating account/i,
    });
    expect(submitButton).toBeInTheDocument();
  });

  it('should disable submit button when isLoading is true', () => {
    const loadingProps = { ...mockProps, isLoading: true };
    render(<SignUpForm {...loadingProps} />);

    const submitButton = screen.getByRole('button', {
      name: /creating account/i,
    });
    expect(submitButton).toBeDisabled();
  });
});
