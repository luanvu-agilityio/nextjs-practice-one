import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
const mockGetFriendlyMessage = jest.fn();
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: (e: unknown) => mockGetFriendlyMessage(e),
}));

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
  }: {
    handleSelect2FAMethod?: (m: 'email' | 'sms') => unknown;
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
    </div>
  ),
}));

jest.mock('../SignInHeader', () => ({ SignInHeader: () => <div /> }));
jest.mock('../SignInFooter', () => ({ SignInFooter: () => <div /> }));

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

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (...a: unknown[]) => unknown) => () =>
      fn({ email: 'a@b.com', password: 'P@ssw0rd' }),
    formState: { isSubmitting: false },
  }),
}));

import { SignInPageContent } from '..';

describe('SignInPageContent - cover final branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
    mockSend2FACode.mockResolvedValue({ success: true });
    mockGetFriendlyMessage.mockReturnValue(undefined);
  });

  it('invalid code length shows invalid-code toast (covers invalid-code branch)', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatch = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    // state order: isLoading, requires2FA, twoFactorMethod, twoFactorCode, userEmail, userPassword, userPhone
    const values: unknown[] = [
      false,
      true,
      'email',
      '123',
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
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('Invalid Code');
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('signIn.email returns string error -> uses fallback message (covers signIn.error-without-message)', async () => {
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
      mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
      mockSignInEmail.mockResolvedValueOnce({ error: 'some-string' });
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));
      await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('Sign in failed');
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('resend rejects and getFriendlyMessage undefined -> uses fallback resend description', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatch = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    const values: unknown[] = [
      false,
      true,
      'email',
      '',
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
      mockSend2FACode.mockRejectedValueOnce(new Error('boom'));
      mockGetFriendlyMessage.mockReturnValueOnce(undefined);
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend'));
      await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('Failed to resend code');
    } finally {
      useStateSpy.mockRestore();
    }
  });
});
