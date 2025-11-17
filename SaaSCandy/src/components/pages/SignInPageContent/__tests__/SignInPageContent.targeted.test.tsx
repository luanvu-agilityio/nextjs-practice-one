import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
const mockGetFriendlyMessage = jest.fn(() => undefined);
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: (e: unknown) => mockGetFriendlyMessage(e),
}));

// Minimal form mocks to expose handlers used by the component
jest.mock('@/components/form', () => ({
  SignInForm: ({ onSubmit }: { onSubmit: () => unknown }) => (
    <div>
      <button data-testid='signin-submit' onClick={() => onSubmit()}>
        Sign In
      </button>
    </div>
  ),
  TwoFactorForm: ({
    onCodeChange,
    onVerify,
    onResend,
  }: {
    onCodeChange?: (e: { target: { value: string } }) => unknown;
    onVerify?: () => unknown;
    onResend?: () => unknown;
  }) => (
    <div>
      <input
        data-testid='twofactor-code'
        onChange={e =>
          onCodeChange?.({
            target: { value: (e.target as HTMLInputElement).value },
          })
        }
      />
      <button data-testid='verify' onClick={() => onVerify?.()} />
      <button data-testid='resend' onClick={() => onResend?.()} />
    </div>
  ),
  Sms2FAForm: ({
    onVerify,
    onResend,
  }: {
    onVerify?: () => unknown;
    onResend?: () => unknown;
  }) => (
    <div>
      <button data-testid='sms-verify' onClick={() => onVerify?.()} />
      <button data-testid='resend-sms' onClick={() => onResend?.()} />
    </div>
  ),
}));

// TwoFAMethodSelector mock will expose a button to call handleSms2FAVerify so we can
// exercise the phone-required guard branch in isolation.
jest.mock('../TwoFAMethodSelector', () => ({
  TwoFAMethodSelector: ({
    handleSelect2FAMethod,
    handleSms2FAVerify,
  }: {
    handleSelect2FAMethod?: (m: 'email' | 'sms') => unknown;
    handleSms2FAVerify?: () => unknown;
  }) => (
    <div>
      <button
        data-testid='select-email'
        onClick={() => handleSelect2FAMethod?.('email')}
      />
      <button
        data-testid='select-sms'
        onClick={() => handleSelect2FAMethod?.('sms')}
      />
      <button
        data-testid='sms-verify-method'
        onClick={() => handleSms2FAVerify?.()}
      />
    </div>
  ),
}));

jest.mock('../SignInHeader', () => ({ SignInHeader: () => <div /> }));
jest.mock('../SignInFooter', () => ({ SignInFooter: () => <div /> }));

// service / auth-client
const mockSend2FACode = jest.fn();
const mockVerify2FACode = jest.fn();
const mockSignInEmail = jest.fn();
jest.mock('@/service', () => ({
  send2FACode: (...args: unknown[]) => mockSend2FACode(...args),
  verify2FACode: (...args: unknown[]) => mockVerify2FACode(...args),
}));
jest.mock('@/lib/auth-client', () => ({
  signIn: { email: (...args: unknown[]) => mockSignInEmail(...args) },
}));

// next/navigation
const push = jest.fn();
const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));

// simple useForm mock
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (...a: unknown[]) => unknown) => () =>
      fn({ email: 'a@b.com', password: 'P@ssw0rd' }),
    formState: { isSubmitting: false },
  }),
}));

import { SignInPageContent } from '..';
import { ROUTES } from '@/constants';

describe('SignInPageContent - targeted branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockResolvedValue({ success: true });
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
  });

  it('invalid 2FA code length shows error toast and does not call verify', async () => {
    render(<SignInPageContent />);

    // Start sign-in and choose email method
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));
    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );

    // Input an invalid (short) code and click verify
    fireEvent.change(screen.getByTestId('twofactor-code'), {
      target: { value: '12' },
    });
    fireEvent.click(screen.getByTestId('verify'));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    expect(mockVerify2FACode).not.toHaveBeenCalled();
  });

  it('select-email when send2FACode returns success:false shows error toast', async () => {
    mockSend2FACode.mockResolvedValueOnce({ success: false, error: 'nope' });

    render(<SignInPageContent />);
    fireEvent.click(screen.getByTestId('signin-submit'));

    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    // send2FACode runs asynchronously inside handler; wait for toast
    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('handleSms2FAVerify with no phone shows phone-required toast', async () => {
    render(<SignInPageContent />);
    // Open the 2FA selector (must enter the 2FA step first)
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-sms')).toBeInTheDocument()
    );
    // Directly call handleSms2FAVerify via the selector mock
    fireEvent.click(screen.getByTestId('sms-verify-method'));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('successful verify + signIn calls router.push and router.refresh', async () => {
    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
    mockSignInEmail.mockResolvedValueOnce({ error: undefined });

    render(<SignInPageContent />);
    // Sign in flow -> choose email -> enter valid code -> verify
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));
    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );

    fireEvent.change(screen.getByTestId('twofactor-code'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByTestId('verify'));

    await waitFor(() => expect(mockVerify2FACode).toHaveBeenCalled());
    await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
    await waitFor(() => expect(push).toHaveBeenCalled());
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });
});
