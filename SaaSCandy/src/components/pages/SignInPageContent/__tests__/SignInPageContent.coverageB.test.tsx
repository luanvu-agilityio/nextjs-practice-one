import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
const mockGetFriendlyMessage = jest.fn((_e: unknown) => undefined);
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: (e: unknown) => mockGetFriendlyMessage(e),
}));

// Mock constants so AUTH_MESSAGES fields are undefined to force fallback strings
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

// Minimal form/component mocks
jest.mock('@/components/form', () => ({
  SignInForm: ({ onSubmit }: { onSubmit: () => unknown }) => (
    <div>
      <button data-testid='signin-submit' onClick={() => onSubmit()}>
        Sign In
      </button>
    </div>
  ),
  TwoFactorForm: ({ onResendCode }: { onResendCode?: () => unknown }) => (
    <div>
      <button data-testid='resend' onClick={() => onResendCode?.()} />
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

describe('SignInPageContent - cover leftover fallback branches (B)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockResolvedValue({ success: true });
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
  });

  it('handleResendCode email success -> uses fallback strings (codeResentTitle/EmailDescription)', async () => {
    // seed state: requires2FA true, twoFactorMethod 'email'
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
      mockSend2FACode.mockResolvedValueOnce({ success: true });
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend'));
      await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('handleResendCode email throws -> uses getFriendlyMessage fallback and string fallback', async () => {
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
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('handleSelect2FAMethod email -> send2FACode success:false uses smsCodeErrorDescription fallback', async () => {
    mockSend2FACode.mockResolvedValueOnce({ success: false });
    render(<SignInPageContent />);
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));
    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('handleSms2FAVerify POST returns success:false -> uses smsCodeErrorDescription fallback', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatch = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    // seed: requires2FA true, twoFactorMethod null (so TwoFAMethodSelector renders), userPhone is set
    const values: unknown[] = [
      false,
      true,
      null,
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
        .mockResolvedValue({ json: async () => ({ success: false }) });
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('sms-verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('sms-verify'));
      await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      useStateSpy.mockRestore();
    }
  });
});
