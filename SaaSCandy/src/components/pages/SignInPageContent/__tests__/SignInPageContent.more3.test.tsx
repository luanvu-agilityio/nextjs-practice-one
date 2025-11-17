import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
const mockGetFriendlyMessage = jest.fn(() => undefined);
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: (e: unknown) => mockGetFriendlyMessage(e),
}));

// Minimal form mocks that expose the handlers we need
jest.mock('@/components/form', () => ({
  SignInForm: ({
    onSubmit,
    onSocialSignIn,
  }: {
    onSubmit: () => unknown;
    onSocialSignIn?: (p: string) => unknown;
  }) => (
    <div>
      <button data-testid='signin-submit' onClick={() => onSubmit()}>
        Sign In
      </button>
      <button
        data-testid='social-google'
        onClick={() => onSocialSignIn?.('google')}
      />
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

// TwoFAMethodSelector mock
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

// Provide a SignInHeader mock
jest.mock('../SignInHeader', () => ({ SignInHeader: () => <div /> }));

// Replace SignInFooter with a mock that exposes the forgot-password handler for one test
jest.mock('../SignInFooter', () => ({
  SignInFooter: ({
    handleForgotPassword,
  }: {
    handleForgotPassword?: () => unknown;
  }) => (
    <div>
      <button data-testid='forgot' onClick={() => handleForgotPassword?.()} />
    </div>
  ),
}));

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

describe('SignInPageContent - next focused branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockResolvedValue({ success: true });
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
    mockGetFriendlyMessage.mockReturnValue(undefined);
  });

  it('resend (email) that throws uses getFriendlyMessage in catch', async () => {
    // The component calls send2FACode when selecting email (then-based chain).
    // To avoid an unhandled rejection from that initial call, resolve the first
    // call. Then make the resend call reject so the try/catch in handleResendCode runs.
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    mockSend2FACode.mockRejectedValueOnce(new Error('boom'));
    mockGetFriendlyMessage.mockReturnValueOnce('friendly-error');

    render(<SignInPageContent />);
    // trigger sign-in -> select email -> TwoFactorForm
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));
    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );

    // Click resend (email) which calls handleResendCode and should hit the rejection
    fireEvent.click(screen.getByTestId('resend'));

    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('forgot password calls router.push with FORGOT_PASSWORD', async () => {
    render(<SignInPageContent />);
    // SignInFooter mock exposes the forgot button
    fireEvent.click(screen.getByTestId('forgot'));
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(ROUTES.FORGOT_PASSWORD)
    );
  });

  it('sms verify (POST) success path shows toast and calls fetch', async () => {
    // Seed internal state so component immediately shows Sms2FAForm with a phone
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatch = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    const values: unknown[] = [
      false,
      true,
      'sms',
      '123456',
      'a@b.com',
      'P@ssw0rd',
      '555',
    ];
    let idx = 0;
    useStateSpy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ success: true }) });

    render(<SignInPageContent />);
    await waitFor(() =>
      expect(screen.getByTestId('sms-verify')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('sms-verify'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    useStateSpy.mockRestore();
  });

  it('resend-sms (POST) success path shows toast', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatch = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    const values: unknown[] = [
      false,
      true,
      'sms',
      '',
      'a@b.com',
      'P@ssw0rd',
      '555',
    ];
    let idx = 0;
    useStateSpy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ success: true }) });

    render(<SignInPageContent />);
    await waitFor(() =>
      expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('resend-sms'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    useStateSpy.mockRestore();
  });
});
