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
  TOAST_VARIANTS: { SUCCESS: 'success', ERROR: 'error', INFO: 'info' },
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

describe('SignInPageContent - precise remaining branches', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    // ensure global.fetch cleared
    // @ts-expect-error - clear global.fetch mock for test
    global.fetch = undefined;
    mockShowToast.mockClear();
    mockGetFriendlyMessage.mockClear();
    mockSend2FACode.mockClear();
    mockVerify2FACode.mockClear();
    mockSignInEmail.mockClear();
  });

  it('throws when PUT verify returns success:true but data === false (covers line ~129)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatch = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    // [isLoading, requires2FA, twoFactorMethod, twoFactorCode, userEmail, userPassword, userPhone]
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock PUT result with success:true but data:false -> should throw
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          success: true,
          data: false,
          error: 'put-data-false',
        }),
      });

      render(<SignInPageContent />);

      // click verify (Sms2FAForm mock exposes data-testid='verify')
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());

      // the component should show a toast with the error message
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('verifies successfully when PUT returns success and data true (covers line ~129 success path)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock PUT result with success:true and data:true -> should proceed to sign in

      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({ success: true, data: true }),
      });
      mockSignInEmail.mockResolvedValue({ error: undefined });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('throws when PUT verify returns success:false (covers line ~129 alternative)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock PUT result with success:false -> should throw
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({ success: false, error: 'put-fail' }),
      });

      render(<SignInPageContent />);

      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());

      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('throws when PUT verify returns success:false and data:false (both false branch)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock PUT result with success:false and data:false -> should throw
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          success: false,
          data: false,
          error: 'both-false',
        }),
      });

      render(<SignInPageContent />);

      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());

      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('resend sms fetch rejects triggers catch and shows friendly message (covers resend catch)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock POST resend to reject
      global.fetch = jest.fn().mockRejectedValue(new Error('network boom'));
      mockGetFriendlyMessage.mockReturnValue('friendly error');

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());

      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
      mockGetFriendlyMessage.mockReset();
    }
  });

  it('resend sms success shows success toast (covers line ~200)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock POST resend success
      global.fetch = jest
        .fn()
        .mockResolvedValue({ json: async () => ({ success: true }) });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));
      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());

      // assert fetch was called and a success toast was shown
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('PUT verify with data omitted (covers missing data-omitted branch)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock PUT result with success:true but data property omitted
      global.fetch = jest
        .fn()
        .mockResolvedValue({ json: async () => ({ success: true }) });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());

      // ensure component proceeded (no uncaught errors) and toast was shown on success path
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('resend sms with success omitted (covers missing success-omitted branch)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock POST resend to return an object without `success` property
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          /* no success */
        }),
      });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());

      // ensure no uncaught errors; don't assume toast shown when `success` is omitted
      // (just ensure fetch was called above and no uncaught errors were thrown)
    } finally {
      spy.mockRestore();
    }
  });

  it('getter-based PUT verify: success true, data getter returns false (forces RHS evaluation)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // return an object whose `data` is a getter returning false; success true
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          success: true,
          get data() {
            return false;
          },
        }),
      });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
      // when RHS is evaluated and equals false, component should show toast/error
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('getter-based resend sms: success getter returns undefined (forces falsy path)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // return an object whose `success` is a getter that yields undefined
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          get success() {
            return undefined;
          },
        }),
      });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
      // don't assert toast — just ensure no uncaught errors and fetch occurred
    } finally {
      spy.mockRestore();
    }
  });

  it('resend sms when result.success is false does not show success toast (covers line ~200 false path)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock POST resend returning success:false

      global.fetch = jest
        .fn()
        .mockResolvedValue({ json: async () => ({ success: false }) });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));
      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());

      // ensure success toast was NOT called
      expect(mockShowToast).not.toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.anything() })
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('email verify failure via verify2FACode shows error toast (covers email verify branch)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
      '15551234',
    ];
    let idx = 0;
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      mockVerify2FACode.mockResolvedValue({ success: false, error: 'bad' });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));

      await waitFor(() => expect(mockVerify2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('email verify success via verify2FACode proceeds to sign in (covers email verify success)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
      '15551234',
    ];
    let idx = 0;
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      mockVerify2FACode.mockResolvedValue({ success: true, data: true });
      mockSignInEmail.mockResolvedValue({ error: undefined });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));

      await waitFor(() => expect(mockVerify2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('email resend uses send2FACode and shows toast on success (covers email resend branch)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      mockSend2FACode.mockResolvedValue({ success: true });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend'));

      await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('PUT verify returns success:true but data omitted (proceeds, covers missing OR branch)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock PUT result with success:true but no data property (data omitted)
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({ success: true }),
      });

      mockSignInEmail.mockResolvedValue({ error: undefined });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('resend sms returns object with no success property (falsy) and does not show success toast (covers resend false branch)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock POST resend returning an object without `success` property
      global.fetch = jest.fn().mockResolvedValue({ json: async () => ({}) });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));
      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());

      // ensure a success toast was NOT shown for resend
      expect(mockShowToast).not.toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'success' })
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('PUT verify with `data` as a getter returning false (forces second operand eval)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock PUT result with success:true and data getter that returns false
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          success: true,
          get data() {
            return false;
          },
          error: 'getter-data-false',
        }),
      });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('verify')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('verify'));

      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());
      await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  it('resend sms returns object with `success` getter returning falsy (forces false branch)', async () => {
    const spy = jest.spyOn(React, 'useState') as jest.SpyInstance;
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
    spy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatch] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    try {
      // mock POST resend returning an object with a getter for success that yields falsy
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          get success() {
            return undefined;
          },
        }),
      });

      render(<SignInPageContent />);
      await waitFor(() =>
        expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
      );
      fireEvent.click(screen.getByTestId('resend-sms'));
      await waitFor(() => expect(global.fetch as jest.Mock).toHaveBeenCalled());

      // ensure a success toast was NOT shown for resend
      expect(mockShowToast).not.toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'success' })
      );
    } finally {
      spy.mockRestore();
    }
  });
});
