import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: () => undefined,
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
jest.mock('@/service', () => ({
  send2FACode: (...args: unknown[]) => mockSend2FACode(...args),
  verify2FACode: jest.fn(),
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

describe('SignInPageContent - extra5 targeted branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockResolvedValue({ success: true });
  });

  it('handleResendCode email success -> shows Code Resent fallback', async () => {
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

  it('handleSelect2FAMethod email -> send2FACode success triggers toast', async () => {
    render(<SignInPageContent />);
    // click sign in to render TwoFAMethodSelector
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    fireEvent.click(screen.getByTestId('select-email'));
    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });
});
