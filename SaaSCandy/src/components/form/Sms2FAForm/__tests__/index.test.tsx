import { z } from 'zod';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sms2FAForm } from '../index';

jest.mock('@/utils/validation', () => {
  return {
    sms2faSchema: z.object({
      code: z.string(),
    }),
  };
});
jest.mock('@/components/common', () => ({
  Button: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <button {...props}>{children}</button>
  ),
  Input: (props: Record<string, unknown>) => <input {...props} />,
  InputController: ({
    name,
    label,
    ...props
  }: {
    name: string;
    label: string;
  } & Record<string, unknown>) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} data-testid={name} {...props} />
    </div>
  ),
}));

describe('Sms2FAForm', () => {
  const mockSetCode = jest.fn();
  const mockOnVerify = jest.fn();
  const mockOnResend = jest.fn();
  const mockOnBack = jest.fn();

  const defaultProps = {
    phone: '+1234567890',
    code: '',
    setCode: mockSetCode,
    onVerify: mockOnVerify,
    onResend: mockOnResend,
    onBack: mockOnBack,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      render(<Sms2FAForm {...defaultProps} />);

      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Enter Code')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Verify Code' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Resend Code' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('displays phone number as disabled and readonly', () => {
      render(<Sms2FAForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      expect(phoneInput).toHaveValue('+1234567890');
      expect(phoneInput).toBeDisabled();
      expect(phoneInput).toHaveAttribute('readonly');
    });

    it('renders code input with correct placeholder', () => {
      render(<Sms2FAForm {...defaultProps} />);

      const codeInput = screen.getByTestId('code');
      expect(codeInput).toHaveAttribute('placeholder', '6-digit code');
      expect(codeInput).toHaveAttribute('type', 'text');
      expect(codeInput).toHaveAttribute('required');
    });
  });

  describe('Form Interactions', () => {
    it('allows typing in code input field', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Sms2FAForm {...defaultProps} />);

      const codeInput = screen.getByTestId('code');
      await user.type(codeInput, '123456');

      expect(codeInput).toHaveValue('123456');
    });

    it('calls onResend when resend button is clicked', async () => {
      mockOnResend.mockResolvedValue(undefined);

      render(<Sms2FAForm {...defaultProps} />);

      const resendButton = screen.getByRole('button', { name: 'Resend Code' });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockOnResend).toHaveBeenCalled();
      });

      expect(mockOnVerify).not.toHaveBeenCalled();
      expect(mockSetCode).not.toHaveBeenCalled();
    });

    it('calls onBack when back button is clicked', () => {
      render(<Sms2FAForm {...defaultProps} />);

      const backButton = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
      expect(mockOnVerify).not.toHaveBeenCalled();
      expect(mockOnResend).not.toHaveBeenCalled();
    });

    it('does not call onVerify when form is submitted with empty code', async () => {
      render(<Sms2FAForm {...defaultProps} />);

      const verifyButton = screen.getByRole('button', { name: 'Verify Code' });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(mockOnVerify).not.toHaveBeenCalled();
        expect(mockSetCode).not.toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('disables verify button when isLoading is true', () => {
      render(<Sms2FAForm {...defaultProps} isLoading={true} />);

      const verifyButton = screen.getByRole('button', { name: 'Verifying...' });
      expect(verifyButton).toBeDisabled();
    });

    it('disables resend button when isLoading is true', () => {
      render(<Sms2FAForm {...defaultProps} isLoading={true} />);

      const resendButton = screen.getByRole('button', { name: 'Resend Code' });
      expect(resendButton).toBeDisabled();
    });

    it('does not disable back button when isLoading is true', () => {
      render(<Sms2FAForm {...defaultProps} isLoading={true} />);

      const backButton = screen.getByRole('button', { name: 'Back' });
      expect(backButton).not.toBeDisabled();
    });

    it('changes verify button text to "Verifying..." when loading', () => {
      render(<Sms2FAForm {...defaultProps} isLoading={true} />);

      expect(
        screen.getByRole('button', { name: 'Verifying...' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Verify Code' })
      ).not.toBeInTheDocument();
    });

    it('shows "Verify Code" text when not loading', () => {
      render(<Sms2FAForm {...defaultProps} isLoading={false} />);

      expect(
        screen.getByRole('button', { name: 'Verify Code' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Verifying...' })
      ).not.toBeInTheDocument();
    });
  });

  describe('Button Types', () => {
    it('verify button has type submit', () => {
      render(<Sms2FAForm {...defaultProps} />);

      const verifyButton = screen.getByRole('button', { name: 'Verify Code' });
      expect(verifyButton).toHaveAttribute('type', 'submit');
    });

    it('resend button has type button', () => {
      render(<Sms2FAForm {...defaultProps} />);

      const resendButton = screen.getByRole('button', { name: 'Resend Code' });
      expect(resendButton).toHaveAttribute('type', 'button');
    });

    it('back button has type button', () => {
      render(<Sms2FAForm {...defaultProps} />);

      const backButton = screen.getByRole('button', { name: 'Back' });
      expect(backButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Multiple Interactions', () => {
    it('allows resending code multiple times', async () => {
      mockOnResend.mockResolvedValue(undefined);

      render(<Sms2FAForm {...defaultProps} />);

      const resendButton = screen.getByRole('button', { name: 'Resend Code' });

      fireEvent.click(resendButton);
      await waitFor(() => {
        expect(mockOnResend).toHaveBeenCalledTimes(1);
      });

      fireEvent.click(resendButton);
      await waitFor(() => {
        expect(mockOnResend).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Phone Number Display', () => {
    it('displays different phone number formats correctly', () => {
      const { rerender } = render(<Sms2FAForm {...defaultProps} />);
      expect(screen.getByLabelText('Phone Number')).toHaveValue('+1234567890');

      rerender(<Sms2FAForm {...defaultProps} phone='+44 20 1234 5678' />);
      expect(screen.getByLabelText('Phone Number')).toHaveValue(
        '+44 20 1234 5678'
      );

      rerender(<Sms2FAForm {...defaultProps} phone='(555) 123-4567' />);
      expect(screen.getByLabelText('Phone Number')).toHaveValue(
        '(555) 123-4567'
      );
    });
  });
});
