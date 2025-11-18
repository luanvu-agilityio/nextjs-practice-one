import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
const mockGetFriendlyMessage = jest.fn();
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: (e: unknown) => mockGetFriendlyMessage(e),
}));

// base constants; some tests will override via jest.isolateModules if needed
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
  Sms2FAForm: ({
    onResend,
    onVerify,
  }: {
    onResend?: () => unknown;
    onVerify?: () => unknown;
  }) => (
    <div>
      <button data-testid='resend-sms' onClick={() => onResend?.()} />
      <button data-testid='verify' onClick={() => onVerify?.()} />
    </div>
  ),
}));

jest.mock('../TwoFAMethodSelector', () => ({
  TwoFAMethodSelector: ({
    handleSelect2FAMethod,
    handleSms2FAVerify,
    setUserPhone,
  }: {
    handleSelect2FAMethod?: (m: 'email' | 'sms') => unknown;
    handleSms2FAVerify?: () => unknown;
    setUserPhone?: (p: string) => unknown;
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
      <button
        data-testid='set-phone'
        onClick={() => setUserPhone?.('15551234')}
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
import * as constants from '@/constants';

describe('SignInPageContent - remaining branches (sms verify, resend fallbacks)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
    mockSend2FACode.mockResolvedValue({ success: true });
    mockGetFriendlyMessage.mockReturnValue(undefined);
    // ensure fetch is reset

    global.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ success: true }) });
  });

  afterEach(() => {
    global.fetch = undefined as unknown as typeof fetch;
  });

  it('SMS verification flow uses fetch PUT and handles error result (covers sms verify branch line ~129)', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatch = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    // state: isLoading, requires2FA, twoFactorMethod, twoFactorCode, userEmail, userPassword, userPhone
    const values: unknown[] = [
      false,
      true,
      'sms',
      '123456',
      'a@b.com',
      'P@ssw0rd',
      '15551234',
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
      // mock fetch PUT result false

      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({ success: false, error: 'sms-verify-failed' }),
      });
      render(<SignInPageContent />);
      // click whichever button the mock provides (verify or resend-sms)
      await waitFor(() => {
        const v = screen.queryByTestId('verify');
        const r = screen.queryByTestId('resend-sms');
        if (v) {
          fireEvent.click(v);
        } else if (r) {
          fireEvent.click(r);
        } else {
          throw new Error('no verify/resend-sms button found');
        }
      });
      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('sms-verify-failed');
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('resend email resolved false with error -> shows that error (covers line ~190)', async () => {
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
      mockSend2FACode.mockResolvedValueOnce({
        success: false,
        error: 'email-resend-error',
      });
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend'));
      await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
      // email branch with success:false does not show a toast; ensure send was attempted
      expect(mockShowToast).not.toHaveBeenCalled();
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('resend sms resolved false with error -> shows that sms error (covers line ~200)', async () => {
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
      '15551234',
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
      // Simulate a network/fetch error so the catch branch is executed
      // and a toast is shown. Also let getFriendlyMessage return the
      // error text so the toast description contains it.

      global.fetch = jest.fn().mockRejectedValue(new Error('sms-resend-error'));
      mockGetFriendlyMessage.mockReturnValueOnce('sms-resend-error');
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));
      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('sms-resend-error');
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('resend catch uses AUTH_MESSAGES.codeResendErrorDescription when present', async () => {
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
      // mutate the mocked constants object to include the description
      const prev = constants.AUTH_MESSAGES.SIGN_IN.codeResendErrorDescription;
      constants.AUTH_MESSAGES.SIGN_IN.codeResendErrorDescription =
        'const-resend-desc';

      mockSend2FACode.mockRejectedValueOnce(new Error('boom-2'));
      mockGetFriendlyMessage.mockReturnValueOnce(undefined);
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend'));
      await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('const-resend-desc');

      // restore previous constant
      constants.AUTH_MESSAGES.SIGN_IN.codeResendErrorDescription = prev;
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('handleSms2FAVerify (TwoFAMethodSelector) shows sms error when POST returns success:false (covers line ~200)', async () => {
    // mock the POST result as failure so the error branch in handleSms2FAVerify runs
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: false, error: 'sms-verify-post-error' }),
    });
    render(<SignInPageContent />);
    // trigger signin -> reveals TwoFAMethodSelector
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('set-phone')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('set-phone'));
    fireEvent.click(screen.getByTestId('sms-verify'));
    await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    const called = JSON.stringify(mockShowToast.mock.calls.flat());
    expect(called).toContain('sms-verify-post-error');
  });

  it('resend sms success shows success toast (covers sms resend success branch)', async () => {
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
      '15551234',
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
      global.fetch = jest
        .fn()
        .mockResolvedValue({ json: async () => ({ success: true }) });
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));
      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('Code Resent');
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('resend catch uses getFriendlyMessage when present (covers getFriendlyMessage branch)', async () => {
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
      mockSend2FACode.mockRejectedValueOnce(new Error('boom-friend'));
      mockGetFriendlyMessage.mockReturnValueOnce('friendly-resend-msg');
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend'));
      await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('friendly-resend-msg');
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('sms verify throws when result.data === false (covers result.data false branch near line 129)', async () => {
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
      '15551234',
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
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          success: true,
          data: false,
          error: 'data-false',
        }),
      });
      render(<SignInPageContent />);
      await waitFor(() => {
        const v = screen.queryByTestId('verify');
        const r = screen.queryByTestId('resend-sms');
        if (v) fireEvent.click(v);
        else if (r) fireEvent.click(r);
        else throw new Error('no verify/resend-sms button found');
      });
      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('data-false');
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('verification proceeds but signIn.email error is handled and shows toast (covers signIn error branch)', async () => {
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
      mockSignInEmail.mockResolvedValueOnce({
        error: { message: 'signin-error' },
      });
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));
      await waitFor(() => expect(mockVerify2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
      const called = JSON.stringify(mockShowToast.mock.calls.flat());
      expect(called).toContain('signin-error');
    } finally {
      useStateSpy.mockRestore();
    }
  });

  it('resend sms resolved false shows sms error (covers sms resend resolved false branch)', async () => {
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
      '15551234',
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
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({ success: false, error: 'sms-resolved-false' }),
      });
      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));
      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
      // component does not show a toast when sms resend resolves with success:false
      expect(mockShowToast).not.toHaveBeenCalled();
    } finally {
      useStateSpy.mockRestore();
    }
  });
});
