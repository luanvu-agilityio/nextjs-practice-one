import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// captured handlers from mocked child components
let capturedSocialSignIn: ((provider: string) => unknown) | undefined;
let capturedHandleSelect2FAMethod:
  | ((method: 'email' | 'sms') => unknown)
  | undefined;
let capturedHandleSms2FAVerify: (() => unknown) | undefined;
let capturedOnCodeChange:
  | ((e: { target: { value: string } }) => unknown)
  | undefined;
let capturedOnVerify: (() => unknown) | undefined;
let _capturedOnResend: (() => unknown) | undefined;
let _capturedOnBack: (() => unknown) | undefined;

// Mock common helpers
const mockShowToast = jest.fn();
const mockGetFriendlyMessage = jest.fn(String);
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: (e: unknown) => mockGetFriendlyMessage(e),
}));

// Mock form components to drive flows and capture handlers
jest.mock('@/components/form', () => ({
  SignInForm: ({
    onSubmit,
    onSocialSignIn,
  }: {
    onSubmit: () => unknown;
    onSocialSignIn?: (provider: string) => unknown;
  }) => {
    // capture handlers; call the submit wrapper without args so react-hook-form's handleSubmit runs
    capturedSocialSignIn = onSocialSignIn;
    return (
      <div>
        <button data-testid='signin-submit' onClick={() => onSubmit()}>
          Sign In
        </button>
        <button
          data-testid='social-google'
          onClick={() => capturedSocialSignIn?.('google')}
        >
          Social Google
        </button>
      </div>
    );
  },
  TwoFactorForm: ({
    onCodeChange,
    onVerify,
    onResend,
    onBack,
  }: {
    onCodeChange?: (e: { target: { value: string } }) => unknown;
    onVerify?: () => unknown;
    onResend?: () => unknown;
    onBack?: () => unknown;
  }) => {
    // capture handlers so tests can trigger them
    capturedOnCodeChange = onCodeChange;
    capturedOnVerify = onVerify;
    _capturedOnResend = onResend;
    _capturedOnBack = onBack;
    return (
      <div>
        <input
          data-testid='twofactor-code'
          onChange={e =>
            capturedOnCodeChange?.({
              target: { value: (e.target as HTMLInputElement).value },
            })
          }
        />
        <button data-testid='verify' onClick={() => capturedOnVerify?.()}>
          Verify
        </button>
        <button data-testid='resend' onClick={() => _capturedOnResend?.()}>
          Resend
        </button>
        <button data-testid='back' onClick={() => _capturedOnBack?.()}>
          Back
        </button>
      </div>
    );
  },
  Sms2FAForm: ({ onVerify }: { onVerify?: () => unknown }) => (
    <div>
      <button data-testid='sms-verify' onClick={() => onVerify?.()}>
        SMS Verify
      </button>
    </div>
  ),
}));

// Mock TwoFAMethodSelector to capture selection handlers
jest.mock('../TwoFAMethodSelector', () => ({
  TwoFAMethodSelector: ({
    handleSelect2FAMethod,
    handleSms2FAVerify,
  }: {
    handleSelect2FAMethod?: (method: 'email' | 'sms') => unknown;
    handleSms2FAVerify?: () => unknown;
  }) => {
    capturedHandleSelect2FAMethod = handleSelect2FAMethod;
    capturedHandleSms2FAVerify = handleSms2FAVerify;
    return (
      <div>
        <button
          data-testid='select-email'
          onClick={() => capturedHandleSelect2FAMethod?.('email')}
        >
          Email
        </button>
        <button
          data-testid='select-sms'
          onClick={() => capturedHandleSelect2FAMethod?.('sms')}
        >
          SMS
        </button>
        <button
          data-testid='sms-verify-btn'
          onClick={() => capturedHandleSms2FAVerify?.()}
        >
          SMS Verify Button
        </button>
      </div>
    );
  },
}));

// Mock header/footer which rely on next/navigation hooks internally
jest.mock('../SignInHeader', () => ({ SignInHeader: () => <div>Header</div> }));
jest.mock('../SignInFooter', () => ({ SignInFooter: () => <div>Footer</div> }));

// Mock icons
jest.mock('@/icons', () => ({ LogoIcon: () => <span>Logo</span> }));

// Mock services and auth client
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

// Mock social auth util
const mockHandleSocialAuth = jest.fn();
jest.mock('@/utils/social-auth', () => ({
  handleSocialAuth: (...args: unknown[]) => mockHandleSocialAuth(...args),
}));

// Mock next/navigation router and hooks used by nested components (usePathname etc.)
const push = jest.fn();
const refresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => '/',
  useSearchParams: () => ({ get: () => null }),
}));

// Mock react-hook-form so handleSubmit will invoke the provided submit handler with test data
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (...args: unknown[]) => unknown) => () =>
      fn({ email: 'a@b.com', password: 'P@ssw0rd' }),
    formState: { isSubmitting: false },
  }),
}));

import { SignInPageContent } from '..';

describe('SignInPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockResolvedValue({ success: true });
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
    mockHandleSocialAuth.mockResolvedValue(undefined);
    // clear captured handlers
    capturedSocialSignIn = undefined;
    capturedHandleSelect2FAMethod = undefined;
    capturedHandleSms2FAVerify = undefined;
    capturedOnCodeChange = undefined;
    capturedOnVerify = undefined;
    _capturedOnResend = undefined;
    _capturedOnBack = undefined;
  });

  it('full email 2FA success flow', async () => {
    render(<SignInPageContent />);

    // trigger sign in which sets requires2FA and user email/password
    fireEvent.click(screen.getByTestId('signin-submit'));

    // wait for TwoFAMethodSelector buttons to appear and pick email
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());

    // wait for TwoFactorForm to render and enter a valid code
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
  });

  it('shows toast for invalid code length', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatchStub = (() => undefined) as React.Dispatch<
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
      return [v, dispatchStub] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    render(<SignInPageContent />);

    await waitFor(() => expect(capturedOnCodeChange).toBeDefined());
    (capturedOnCodeChange as (e: { target: { value: string } }) => unknown)({
      target: { value: '12' },
    });
    (capturedOnVerify as () => unknown)();

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    useStateSpy.mockRestore();
  });

  it('resend email code calls send2FACode and shows toast', async () => {
    render(<SignInPageContent />);

    // trigger sign in
    fireEvent.click(screen.getByTestId('signin-submit'));

    // select email method
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    // wait for initial send
    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());

    // click resend button in TwoFactorForm
    fireEvent.click(screen.getByTestId('resend'));

    await waitFor(() => {
      expect(mockSend2FACode).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'success' })
      );
    });
  });

  it('handleSms2FAVerify calls API and shows success toast', async () => {
    // ensure component has a phone number in state so SMS verify proceeds
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatchStub = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    // States (in order): isLoading, requires2FA, twoFactorMethod, twoFactorCode, userEmail, userPassword, userPhone
    const values: unknown[] = [
      false,
      true,
      null,
      '123456',
      'a@b.com',
      'P@ssw0rd',
      '5551234',
    ];
    let idx = 0;
    useStateSpy.mockImplementation((init: unknown) => {
      const v = idx < values.length ? values[idx++] : init;
      return [v, dispatchStub] as [
        unknown,
        React.Dispatch<React.SetStateAction<unknown>>,
      ];
    });

    // mock fetch for SMS 2FA POST
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ success: true }) });

    render(<SignInPageContent />);

    // TwoFAMethodSelector should be rendered because requires2FA === true (from our useState mock)
    // Prefer calling the captured handleSms2FAVerify directly so we control timing and ensure userPhone/code are set
    expect(capturedHandleSms2FAVerify).toBeDefined();
    (capturedHandleSms2FAVerify as () => unknown)();

    // wait for the SMS send API (fetch) to have been called
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());

    // After successful SMS send the Sms2FAForm should be rendered; trigger its verify button
    if (screen.queryByTestId('sms-verify')) {
      fireEvent.click(screen.getByTestId('sms-verify'));
    } else if (capturedOnVerify) {
      (capturedOnVerify as () => unknown)();
    }

    // wait for the success toast
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'success' })
      )
    );

    useStateSpy.mockRestore();
  });

  it('shows error toast when signIn.email fails after verification', async () => {
    // make signIn return an error after verification
    mockSignInEmail.mockResolvedValueOnce({
      error: { message: 'Sign in failed' },
    });

    render(<SignInPageContent />);

    // trigger sign in and select email (be robust to direct TwoFA render paths)
    const signinBtn = screen.queryByTestId('signin-submit');
    if (signinBtn) fireEvent.click(signinBtn);
    if (screen.queryByTestId('select-email')) {
      fireEvent.click(screen.getByTestId('select-email'));
    } else if (capturedHandleSelect2FAMethod) {
      (capturedHandleSelect2FAMethod as (m: 'email' | 'sms') => unknown)(
        'email'
      );
    }

    // enter code and verify (cover different render paths)
    if (screen.queryByTestId('twofactor-code')) {
      await waitFor(() =>
        expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
      );
      fireEvent.change(screen.getByTestId('twofactor-code'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByTestId('verify'));
    } else {
      // if TwoFactorForm isn't rendered but handlers were captured, call them directly
      if (capturedOnCodeChange) {
        (capturedOnCodeChange as (e: { target: { value: string } }) => unknown)(
          {
            target: { value: '123456' },
          }
        );
      }
      if (capturedOnVerify) (capturedOnVerify as () => unknown)();
    }

    // wait for the sign-in attempt and toast
    await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'error' })
      )
    );
  });

  it('handles social sign-in error', async () => {
    mockHandleSocialAuth.mockRejectedValue(new Error('social-fail'));
    render(<SignInPageContent />);

    // social button triggers capturedSocialSignIn -> parent will call handleSocialAuth which rejects
    fireEvent.click(screen.getByTestId('social-google'));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });
});
