import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
const mockGetFriendlyMessage = jest.fn((_e: unknown) => undefined);
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: (e: unknown) => mockGetFriendlyMessage(e),
}));
// Keep AUTH_MESSAGES empty to force fallback strings in some branches
jest.mock('@/constants', () => ({
  API_ROUTES: { AUTH: { SEND_2FA_SMS: '/api/2fa/sms' } },
  ROUTES: { HOME: '/', FORGOT_PASSWORD: '/forgot' },
  TOAST_MESSAGES: {
    SOCIAL: {
      SIGNIN_REDIRECT: { title: 't', description: '{provider}' },
      SIGNIN_ERROR: { title: 't', description: '{provider}' },
    },
  },
  AUTH_MESSAGES: { SIGN_IN: {} },
}));

jest.mock('@/components/form', () => ({
  SignInForm: ({ onSubmit }: { onSubmit: () => unknown }) => (
    <div>
      <button data-testid='signin-submit' onClick={() => onSubmit()}>
        Sign In
      </button>
    </div>
  ),
  TwoFactorForm: ({
    onResendCode,
    onVerify,
  }: {
    onResendCode?: () => unknown;
    onVerify?: () => unknown;
  }) => (
    <div>
      <button data-testid='resend' onClick={() => onResendCode?.()} />
      <button data-testid='verify' onClick={() => onVerify?.()} />
    </div>
  ),
  Sms2FAForm: ({ onResend }: { onResend?: () => unknown }) => (
    <div>
      <button data-testid='resend-sms' onClick={() => onResend?.()} />
    </div>
  ),
}));

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
      <button data-testid='sms-verify' onClick={() => handleSms2FAVerify?.()} />
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

// react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (...a: unknown[]) => unknown) => () =>
      fn({ email: 'a@b.com', password: 'P@ssw0rd' }),
    formState: { isSubmitting: false },
  }),
}));

import { SignInPageContent } from '..';

describe('SignInPageContent - cover remaining branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockResolvedValue({ success: true });
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
  });

  it('verify success -> signIn.email returns error without message -> shows fallback "Sign in failed"', async () => {
    // seed: requires2FA true, twoFactorMethod email, valid code
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatch = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    const values: unknown[] = [
      false, // isLoading
      true, // requires2FA
      'email', // twoFactorMethod
      '123456', // twoFactorCode
      'a@b.com', // userEmail
      'P@ssw0rd', // userPassword
      '', // userPhone
    ];
    let idx = 0;
    useStateSpy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
      mockSignInEmail.mockResolvedValueOnce({ error: {} });
      render(<SignInPageContent />);
      // TwoFactorForm should be present (verify button)
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      // click verify to run through verification flow
      fireEvent.click(screen.getByTestId('verify'));
      await waitFor(() => expect(mockVerify2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const calledWith = mockShowToast.mock.calls.flat();
      const found = JSON.stringify(calledWith).includes('Sign in failed');
      expect(found).toBeTruthy();
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('verify rejects with non-Error -> shows verification-failed fallback description', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatch = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    const values: unknown[] = [
      false,
      true,
      'email',
      '123456',
      'a@b.com',
      'P@ssw0rd',
      '',
    ];
    let idx = 0;
    useStateSpy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      mockVerify2FACode.mockRejectedValueOnce('boom');
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));
      await waitFor(() => expect(mockVerify2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('Invalid or expired code');
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('verify returns success:false -> throws and shows "Invalid verification code" fallback', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatch = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    const values: unknown[] = [
      false,
      true,
      'email',
      '123456',
      'a@b.com',
      'P@ssw0rd',
      '',
    ];
    let idx = 0;
    useStateSpy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      mockVerify2FACode.mockResolvedValueOnce({ success: false, data: false });
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));
      await waitFor(() => expect(mockVerify2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('Invalid verification code');
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('handleResendCode sms fetch rejects -> uses getFriendlyMessage fallback and final string fallback', async () => {
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

    try {
      globalThis.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('boom')) as unknown as typeof fetch;
      mockGetFriendlyMessage.mockReturnValueOnce(undefined);
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));
      await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('Failed to resend code');
    } finally {
      useStateSpy.mockRestore();
      // restore fetch
      delete (globalThis as { fetch?: typeof fetch }).fetch;
    }
  });
});
