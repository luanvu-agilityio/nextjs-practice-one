import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: (e: unknown) => String(e),
}));

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

const mockHandleSocialAuth = jest.fn();
jest.mock('@/utils/social-auth', () => ({
  handleSocialAuth: (...args: unknown[]) => mockHandleSocialAuth(...args),
}));

const push = jest.fn();
const refresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => '/signin',
  useSearchParams: () => ({ get: () => null }),
}));

// Mock form components to expose test hooks (buttons/inputs)
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
      >
        Social Google
      </button>
    </div>
  ),
  TwoFactorForm: ({
    onCodeChange,
    onVerify,
    onResendCode,
    onBack,
  }: {
    onCodeChange?: (e: { target: { value: string } }) => unknown;
    onVerify?: () => unknown;
    onResendCode?: () => unknown;
    onBack?: () => unknown;
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
      <button data-testid='verify' onClick={() => onVerify?.()}>
        Verify
      </button>
      <button data-testid='resend' onClick={() => onResendCode?.()}>
        Resend
      </button>
      <button data-testid='back' onClick={() => onBack?.()}>
        Back
      </button>
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
      <button data-testid='sms-verify' onClick={() => onVerify?.()}>
        SMS Verify
      </button>
      <button data-testid='sms-resend' onClick={() => onResend?.()}>
        SMS Resend
      </button>
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
      >
        Email
      </button>
      <button
        data-testid='select-sms'
        onClick={() => handleSelect2FAMethod?.('sms')}
      >
        SMS
      </button>
      <button
        data-testid='sms-verify-btn'
        onClick={() => handleSms2FAVerify?.()}
      >
        SMS Verify Button
      </button>
    </div>
  ),
}));

jest.mock('../SignInHeader', () => ({ SignInHeader: () => <div>Header</div> }));
jest.mock('../SignInFooter', () => ({
  SignInFooter: ({
    handleForgotPassword,
  }: {
    handleForgotPassword?: () => void;
  }) => (
    <div>
      <button
        data-testid='forgot-password'
        onClick={() => handleForgotPassword?.()}
      >
        Forgot
      </button>
    </div>
  ),
}));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (data: unknown) => unknown) => () =>
      fn({ email: 'a@b.com', password: 'P@ssw0rd' }),
    formState: { isSubmitting: false },
  }),
}));

import { SignInPageContent } from '..';

describe('SignInPageContent extra3 - targeted branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockResolvedValue({ success: true });
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
  });

  it('shows invalid code toast when code length !== 6', async () => {
    render(<SignInPageContent />);
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );

    // enter short code
    fireEvent.change(screen.getByTestId('twofactor-code'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByTestId('verify'));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('handles SMS verify failure (PUT path) and shows toast', async () => {
    // force component state so twoFactorMethod === 'sms' and twoFactorCode length === 6 and userPhone set
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatchStub = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    const values: unknown[] = [
      false,
      true,
      'sms',
      '123456',
      'a@b.com',
      'P@ssw0rd',
      '5550000',
    ];
    let idx = 0;
    useStateSpy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatchStub] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: false, error: 'bad' }),
    });

    render(<SignInPageContent />);
    // Sms2FAForm should render since useState set twoFactorMethod to 'sms'
    await waitFor(() =>
      expect(screen.getByTestId('sms-verify')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId('sms-verify'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    useStateSpy.mockRestore();
  });

  it('resends code for email by calling send2FACode and shows success toast', async () => {
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    render(<SignInPageContent />);
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    await waitFor(() =>
      expect(screen.getByTestId('resend')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('resend'));

    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('shows error toast when resend (email) throws', async () => {
    // make initial send (select-email) succeed so selecting email doesn't error,
    // then make the resend call reject so the catch branch runs.
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    mockSend2FACode.mockImplementationOnce(() =>
      Promise.reject(new Error('boom'))
    );
    render(<SignInPageContent />);
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    await waitFor(() =>
      expect(screen.getByTestId('resend')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('resend'));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('resends code for sms via fetch POST and shows success toast', async () => {
    // prepare state to be in SMS form
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatchStub = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    const values: unknown[] = [
      false,
      true,
      'sms',
      '',
      'a@b.com',
      'P@ssw0rd',
      '5559999',
    ];
    let idx = 0;
    useStateSpy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatchStub] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ success: true }) });

    render(<SignInPageContent />);
    await waitFor(() =>
      expect(screen.getByTestId('sms-resend')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('sms-resend'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    useStateSpy.mockRestore();
  });

  it('navigates to forgot password when footer trigger clicked', async () => {
    render(<SignInPageContent />);
    await waitFor(() =>
      expect(screen.getByTestId('forgot-password')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('forgot-password'));
    expect(push).toHaveBeenCalledWith(expect.stringContaining('forgot'));
  });

  it('successful email verification signs in and navigates home', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatchStub = (() => undefined) as React.Dispatch<
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
      return [v, dispatchStub] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
    mockSignInEmail.mockResolvedValueOnce({ error: undefined });

    render(<SignInPageContent />);
    await waitFor(() =>
      expect(screen.getByTestId('verify')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('verify'));

    await waitFor(() => expect(mockVerify2FACode).toHaveBeenCalled());
    await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
    await waitFor(() => expect(push).toHaveBeenCalled());

    useStateSpy.mockRestore();
  });

  it('shows toast when signIn.email returns error after verify', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatchStub = (() => undefined) as React.Dispatch<
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
      return [v, dispatchStub] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
    mockSignInEmail.mockResolvedValueOnce({
      error: { message: 'signin failed' },
    });

    render(<SignInPageContent />);
    await waitFor(() =>
      expect(screen.getByTestId('verify')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('verify'));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
    useStateSpy.mockRestore();
  });

  it('shows phone-required toast when SMS verify called with empty phone', async () => {
    render(<SignInPageContent />);
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-sms')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-sms'));
    // After selecting SMS the component may render the Sms2FAForm (sms-verify) or the selector button (sms-verify-btn).
    const smsVerifyBtn = screen.queryByTestId('sms-verify-btn');
    if (smsVerifyBtn) {
      fireEvent.click(smsVerifyBtn);
    } else {
      fireEvent.click(screen.getByTestId('sms-verify'));
    }
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('shows toast on social sign-in error', async () => {
    mockHandleSocialAuth.mockImplementationOnce(() =>
      Promise.reject(new Error('social boom'))
    );
    render(<SignInPageContent />);
    // click social sign-in button on the mocked SignInForm
    fireEvent.click(screen.getByTestId('social-google'));
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('back button from 2FA returns to sign in form', async () => {
    // Drive the UI so internal state updates naturally (avoid useState spying here)
    render(<SignInPageContent />);
    // go through submit -> select email -> then click back
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));
    await waitFor(() => expect(screen.getByTestId('back')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('back'));
    await waitFor(() =>
      expect(screen.getByTestId('signin-submit')).toBeInTheDocument()
    );
  });
});
