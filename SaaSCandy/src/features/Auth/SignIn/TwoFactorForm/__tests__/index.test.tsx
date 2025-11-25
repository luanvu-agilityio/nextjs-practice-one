import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('@/components/ui', () => ({
  Button: ({
    children,
    ...props
  }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <button {...(props as unknown as Record<string, unknown>)}>
      {children}
    </button>
  ),
  Input: ({ ...props }: Record<string, unknown>) => (
    <input {...(props as unknown as Record<string, unknown>)} />
  ),
  Heading: ({
    children,
    content,
  }: {
    children?: React.ReactNode;
    content?: React.ReactNode;
  }) => <h3>{children ?? content}</h3>,
  Typography: ({
    children,
    content,
  }: {
    children?: React.ReactNode;
    content?: React.ReactNode;
  }) => <div>{children ?? content}</div>,
}));

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

  beforeEach(() => jest.clearAllMocks());

  it('renders headings and the provided email', () => {
    render(<TwoFactorForm {...mockProps} />);
    expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
    // use a flexible matcher in case the email is wrapped
    expect(
      screen.getByText(
        content =>
          typeof content === 'string' && content.includes('test@example.com')
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Enter Verification Code/i)).toBeInTheDocument();
  });

  it('renders input with correct attributes and calls onCodeChange', () => {
    render(<TwoFactorForm {...mockProps} />);
    const input = screen.getByPlaceholderText('000000');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('maxLength', '6');
    fireEvent.change(input, { target: { value: '123456' } });
    expect(mockProps.onCodeChange).toHaveBeenCalled();
  });

  it('disables verify button when code length is not 6', () => {
    render(<TwoFactorForm {...{ ...mockProps, twoFactorCode: '12345' }} />);
    const verifyButton = screen.getByRole('button', {
      name: /verify & sign in/i,
    });
    expect(verifyButton).toBeDisabled();
  });

  it('enables verify button when code length is 6', () => {
    render(<TwoFactorForm {...{ ...mockProps, twoFactorCode: '123456' }} />);
    const verifyButton = screen.getByRole('button', {
      name: /verify & sign in/i,
    });
    expect(verifyButton).not.toBeDisabled();
  });

  it('shows verifying state and disables verify when loading', () => {
    render(
      <TwoFactorForm
        {...{ ...mockProps, twoFactorCode: '123456', isLoading: true }}
      />
    );
    const verifyingButton = screen.getByRole('button', { name: /verifying/i });
    expect(verifyingButton).toBeDisabled();
  });

  it('calls onVerify, onResendCode and onBack when actions triggered', async () => {
    render(<TwoFactorForm {...{ ...mockProps, twoFactorCode: '123456' }} />);

    fireEvent.click(screen.getByRole('button', { name: /verify & sign in/i }));
    await waitFor(() => expect(mockProps.onVerify).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /resend code/i }));
    await waitFor(() => expect(mockProps.onResendCode).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /change email/i }));
    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('breaks long email addresses and applies break-all class', () => {
    render(
      <TwoFactorForm
        {...{
          ...mockProps,
          userEmail: 'verylongemailaddress@verylongdomainname.com',
        }}
      />
    );

    const emailElement = screen.getByText(
      content =>
        typeof content === 'string' &&
        content.includes('verylongemailaddress@verylongdomainname.com')
    );
    expect(emailElement).toBeInTheDocument();
    expect(emailElement).toHaveClass('break-all');
  });
});
