import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TwoFactorForm } from '../index';

describe('TwoFactorForm', () => {
  const mockProps = {
    userEmail: 'test@example.com',
    twoFactorCode: '',
    onCodeChange: jest.fn(),
    onVerify: jest.fn(),
    onResendCode: jest.fn(),
    onBack: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<TwoFactorForm {...mockProps} />);
    expect(screen.getByText('Check your email')).toBeInTheDocument();
  });

  it('should display user email', () => {
    render(<TwoFactorForm {...mockProps} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display verification code heading', () => {
    render(<TwoFactorForm {...mockProps} />);
    expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
  });

  it('should display code expiration message', () => {
    render(<TwoFactorForm {...mockProps} />);
    expect(screen.getByText('Code expires in 10 minutes')).toBeInTheDocument();
  });

  it('should render input with correct attributes', () => {
    render(<TwoFactorForm {...mockProps} />);
    const input = screen.getByPlaceholderText('000000') as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('maxLength', '6');
    expect(input).toHaveValue('');
  });

  it('should call onCodeChange when input changes', () => {
    render(<TwoFactorForm {...mockProps} />);
    const input = screen.getByPlaceholderText('000000');

    fireEvent.change(input, { target: { value: '123456' } });

    expect(mockProps.onCodeChange).toHaveBeenCalledTimes(1);
  });

  it('should display code value in input', () => {
    const propsWithCode = { ...mockProps, twoFactorCode: '123456' };
    render(<TwoFactorForm {...propsWithCode} />);

    const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
    expect(input).toHaveValue('123456');
  });

  it('should disable verify button when code length is not 6', () => {
    const propsWithShortCode = { ...mockProps, twoFactorCode: '12345' };
    render(<TwoFactorForm {...propsWithShortCode} />);

    const verifyButton = screen.getByRole('button', {
      name: /verify & sign in/i,
    });
    expect(verifyButton).toBeDisabled();
  });

  it('should enable verify button when code length is 6', () => {
    const propsWithFullCode = { ...mockProps, twoFactorCode: '123456' };
    render(<TwoFactorForm {...propsWithFullCode} />);

    const verifyButton = screen.getByRole('button', {
      name: /verify & sign in/i,
    });
    expect(verifyButton).not.toBeDisabled();
  });

  it('should disable verify button when isLoading is true', () => {
    const loadingProps = {
      ...mockProps,
      twoFactorCode: '123456',
      isLoading: true,
    };
    render(<TwoFactorForm {...loadingProps} />);

    const verifyButton = screen.getByRole('button', { name: /verifying/i });
    expect(verifyButton).toBeDisabled();
  });

  it('should display "Verifying..." when loading', () => {
    const loadingProps = { ...mockProps, isLoading: true };
    render(<TwoFactorForm {...loadingProps} />);

    expect(screen.getByText('Verifying...')).toBeInTheDocument();
  });

  it('should call onVerify when verify button is clicked', async () => {
    const propsWithFullCode = { ...mockProps, twoFactorCode: '123456' };
    render(<TwoFactorForm {...propsWithFullCode} />);

    const verifyButton = screen.getByRole('button', {
      name: /verify & sign in/i,
    });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockProps.onVerify).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onResendCode when resend button is clicked', async () => {
    render(<TwoFactorForm {...mockProps} />);

    const resendButton = screen.getByRole('button', { name: /resend code/i });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(mockProps.onResendCode).toHaveBeenCalledTimes(1);
    });
  });

  it('should disable resend button when isLoading is true', () => {
    const loadingProps = { ...mockProps, isLoading: true };
    render(<TwoFactorForm {...loadingProps} />);

    const resendButton = screen.getByRole('button', { name: /resend code/i });
    expect(resendButton).toBeDisabled();
  });

  it('should call onBack when change email button is clicked', () => {
    render(<TwoFactorForm {...mockProps} />);

    const backButton = screen.getByRole('button', { name: /change email/i });
    fireEvent.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('should break long email addresses properly', () => {
    const longEmailProps = {
      ...mockProps,
      userEmail: 'verylongemailaddress@verylongdomainname.com',
    };
    render(<TwoFactorForm {...longEmailProps} />);

    const emailElement = screen.getByText(
      'verylongemailaddress@verylongdomainname.com'
    );
    expect(emailElement).toBeInTheDocument();
    expect(emailElement).toHaveClass('break-all');
  });
});
