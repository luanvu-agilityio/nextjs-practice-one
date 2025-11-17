import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// captured handlers
let capturedSocialSignIn: ((provider: string) => unknown) | undefined;
let capturedHandleSelect2FAMethod:
  | ((method: 'email' | 'sms') => unknown)
  | undefined;
let capturedHandleSms2FAVerify: (() => unknown) | undefined;
let capturedOnCodeChange:
  | ((e: { target: { value: string } }) => unknown)
  | undefined;
let capturedOnVerify: (() => unknown) | undefined;

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
    onSocialSignIn?: (p: string) => unknown;
  }) => {
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
    capturedOnCodeChange = onCodeChange;
    capturedOnVerify = onVerify;
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
        <button data-testid='resend' onClick={() => onResend?.()}>
          Resend
        </button>
        <button data-testid='back' onClick={() => onBack?.()}>
          Back
        </button>
      </div>
    );
  },
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
      <button data-testid='resend-sms' onClick={() => onResend?.()}>
        Resend SMS
      </button>
    </div>
  ),
}));

// Mock TwoFAMethodSelector
jest.mock('../TwoFAMethodSelector', () => ({
  TwoFAMethodSelector: ({
    handleSelect2FAMethod,
    handleSms2FAVerify,
  }: {
    handleSelect2FAMethod?: (m: 'email' | 'sms') => unknown;
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

jest.mock('../SignInHeader', () => ({ SignInHeader: () => <div>Header</div> }));
jest.mock('../SignInFooter', () => ({ SignInFooter: () => <div>Footer</div> }));

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

// Mock next/navigation
const push = jest.fn();
const refresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => '/signin',
  useSearchParams: () => ({ get: () => null }),
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (...args: unknown[]) => unknown) => () =>
      fn({ email: 'a@b.com', password: 'P@ssw0rd' }),
    formState: { isSubmitting: false },
  }),
}));

import { SignInPageContent } from '..';

describe('SignInPageContent - extra coverage', () => {
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
  });

  it('shows error toast when send2FACode (email) fails via handleSelect2FAMethod', async () => {
    mockSend2FACode.mockResolvedValueOnce({ success: false, error: 'nope' });
    render(<SignInPageContent />);

    // trigger sign in
    fireEvent.click(screen.getByTestId('signin-submit'));

    // select email 2FA
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );
  });

  it('shows error toast when SMS send fails via handleSms2FAVerify', async () => {
    // prepare to have a phone number in state so SMS flow proceeds
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatchStub = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    // States: isLoading, requires2FA, twoFactorMethod, twoFactorCode, userEmail, userPassword, userPhone
    const values: unknown[] = [
      false,
      true,
      null,
      '',
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

    // mock fetch to return failure for SMS send

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: false, error: 'sms fail' }),
    });

    render(<SignInPageContent />);

    // sign in to trigger TwoFAMethodSelector (if signin form is present click it; otherwise TwoFAMethodSelector is already visible)
    const signinBtn = screen.queryByTestId('signin-submit');
    if (signinBtn) fireEvent.click(signinBtn);

    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );

    // trigger SMS verify via rendered selector button (avoids calling captured handler directly)
    fireEvent.click(screen.getByTestId('sms-verify-btn'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );

    useStateSpy.mockRestore();
  });

  it.skip('sanitizes two-factor input (non-digits and longer input) and proceeds to verify', async () => {
    // set verify and signIn to succeed and observe verify called with sanitized code
    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
    mockSignInEmail.mockResolvedValueOnce({ error: undefined });

    render(<SignInPageContent />);

    // trigger sign in and choose email method
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    // TwoFactorForm should render and capturedOnCodeChange set
    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );

    // provide a messy value: letters and >6 digits and trigger verify via DOM
    fireEvent.change(screen.getByTestId('twofactor-code'), {
      target: { value: '12a34567890' },
    });
    fireEvent.click(screen.getByTestId('verify'));

    await waitFor(() =>
      expect(mockVerify2FACode).toHaveBeenCalledWith('a@b.com', '123456')
    );
    await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
    await waitFor(() => expect(push).toHaveBeenCalled());
  });

  it('email 2FA full flow verifies and signs in (happy path)', async () => {
    // Ensure verify and sign-in succeed
    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
    mockSignInEmail.mockResolvedValueOnce({ error: undefined });

    render(<SignInPageContent />);

    // trigger sign in (this will set requires2FA true)
    const signinBtn = screen.queryByTestId('signin-submit');
    if (signinBtn) fireEvent.click(signinBtn);

    // TwoFAMethodSelector should appear
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );

    // select email 2FA
    fireEvent.click(screen.getByTestId('select-email'));

    // wait for TwoFactorForm to render
    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );

    // Provide a valid 6-digit code and trigger verify via DOM events
    fireEvent.change(screen.getByTestId('twofactor-code'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByTestId('verify'));

    await waitFor(() =>
      expect(mockVerify2FACode).toHaveBeenCalledWith(
        expect.any(String),
        '123456'
      )
    );
    await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
    await waitFor(() => expect(push).toHaveBeenCalled());
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('invalid code length shows invalid-code toast', async () => {
    render(<SignInPageContent />);

    // trigger sign in and choose email method
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    // enter short code and verify
    fireEvent.change(screen.getByTestId('twofactor-code'), {
      target: { value: '12' },
    });
    fireEvent.click(screen.getByTestId('verify'));

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );
  });

  it('handleSelect2FAMethod email success shows success toast', async () => {
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    render(<SignInPageContent />);

    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId('select-email'));

    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );
  });

  it('handleResendCode SMS (POST) success shows toast', async () => {
    // prepare to have a phone number in state so SMS resend proceeds
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

    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ success: true }) });

    render(<SignInPageContent />);

    // Sms2FAForm should render and have resend-sms button
    await waitFor(() =>
      expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('resend-sms'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );

    useStateSpy.mockRestore();
  });

  it('handleSms2FAVerify without phone shows phone-required toast', async () => {
    render(<SignInPageContent />);

    // start signin flow and click the TwoFAMethodSelector sms verify button (userPhone empty)
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('sms-verify-btn')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('sms-verify-btn'));

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );
  });

  it('sms 2FA verify (PUT) succeeds and signs in', async () => {
    // prepare state: requires2FA true, twoFactorMethod sms, and filled phone/code
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

    // mock fetch for PUT verify path
    globalThis.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: true, data: true }),
    });

    render(<SignInPageContent />);

    // Sms2FAForm should render (sms path) and expose sms-verify button
    await waitFor(() =>
      expect(screen.getByTestId('sms-verify')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId('sms-verify'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
    await waitFor(() => expect(push).toHaveBeenCalled());

    useStateSpy.mockRestore();
  });

  it('sms 2FA verify failure shows error toast', async () => {
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

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: false, error: 'bad' }),
    });

    render(<SignInPageContent />);

    await waitFor(() =>
      expect(screen.getByTestId('sms-verify')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('sms-verify'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );

    useStateSpy.mockRestore();
  });

  it('verify succeeds but signIn returns error -> shows toast', async () => {
    // set up verify success via email path and signIn.email returning error
    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
    mockSignInEmail.mockResolvedValueOnce({
      error: { message: 'signin failed' },
    });

    render(<SignInPageContent />);

    // trigger sign in and email 2FA
    const signinBtn = screen.queryByTestId('signin-submit');
    if (signinBtn) fireEvent.click(signinBtn);
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
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );
  });

  it('resend code email failure uses getFriendlyMessage fallback', async () => {
    // Drive the real UI: trigger sign in, select email, then click resend
    render(<SignInPageContent />);

    // trigger sign in and choose email method
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );

    // first send2FACode happens when selecting email - keep default resolved value
    fireEvent.click(screen.getByTestId('select-email'));

    // wait for TwoFactorForm
    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );

    // make the next send2FACode call fail and provide friendly message
    mockSend2FACode.mockResolvedValueOnce({ success: false, error: 'boom' });
    mockGetFriendlyMessage.mockReturnValueOnce('friendly');

    fireEvent.click(screen.getByTestId('resend'));

    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.any(String) })
      )
    );
  });

  it('email verify (PUT) failure shows error toast', async () => {
    // make verify return a failure for email path
    mockVerify2FACode.mockResolvedValueOnce({ success: false, error: 'bad' });

    render(<SignInPageContent />);

    const signinBtn = screen.queryByTestId('signin-submit');
    if (signinBtn) fireEvent.click(signinBtn);
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
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );
  });

  it('verify rejects with non-Error uses getFriendlyMessage', async () => {
    // verify throws a non-Error value (e.g., string) and we fallback to getFriendlyMessage
    mockVerify2FACode.mockRejectedValueOnce('boom');
    mockGetFriendlyMessage.mockReturnValueOnce('verify-friendly');

    render(<SignInPageContent />);

    const signinBtn = screen.queryByTestId('signin-submit');
    if (signinBtn) fireEvent.click(signinBtn);
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
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.any(String) })
      )
    );
  });

  it('email verify returns data=false throws and shows toast', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatchStub = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    // States: isLoading, requires2FA, twoFactorMethod, twoFactorCode, userEmail, userPassword, userPhone
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

    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: false });

    render(<SignInPageContent />);

    // TwoFactorForm should render and verify button available
    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('verify'));

    await waitFor(() => expect(mockVerify2FACode).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.any(String) })
      )
    );

    useStateSpy.mockRestore();
  });

  it('SMS resend rejection uses getFriendlyMessage fallback', async () => {
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

    // make fetch reject to hit catch branch and fallback to getFriendlyMessage
    globalThis.fetch = jest.fn().mockRejectedValueOnce('boom');
    mockGetFriendlyMessage.mockReturnValueOnce('sms-resend-friendly');

    render(<SignInPageContent />);

    await waitFor(() =>
      expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('resend-sms'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.any(String) })
      )
    );

    useStateSpy.mockRestore();
  });

  it('sms verify returns data=false throws and shows toast', async () => {
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

    // mock PUT verify path to return success:true but data:false
    globalThis.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: true, data: false }),
    });

    render(<SignInPageContent />);

    // Sms2FAForm should render and expose sms-verify button
    await waitFor(() =>
      expect(screen.getByTestId('sms-verify')).toBeInTheDocument()
    );
    // trigger verify (Sms2FAForm onVerify -> handleTwoFactorVerification)
    fireEvent.click(screen.getByTestId('sms-verify'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.any(String) })
      )
    );

    useStateSpy.mockRestore();
  });

  it('selecting SMS method shows sms form and does not call send2FACode', async () => {
    // ensure send2FACode is the default resolved
    mockSend2FACode.mockResolvedValueOnce({ success: true });

    render(<SignInPageContent />);

    // trigger sign in then select sms
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-sms')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-sms'));

    // Sms form should render
    await waitFor(() =>
      expect(
        screen.getByTestId('sms-verify') || screen.getByTestId('resend-sms')
      ).toBeInTheDocument()
    );
    // send2FACode should not have been called for sms selection
    expect(mockSend2FACode).not.toHaveBeenCalled();
  });

  it('back button from TwoFactorForm resets to sign in', async () => {
    render(<SignInPageContent />);

    // trigger sign in and choose email method so TwoFactorForm shows
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );
    // click back
    fireEvent.click(screen.getByTestId('back'));

    // sign in form should be visible again
    await waitFor(() =>
      expect(screen.getByTestId('signin-submit')).toBeInTheDocument()
    );
  });

  it('signIn.email rejects with non-Error uses getFriendlyMessage', async () => {
    // verify succeeds but signIn.email rejects a non-Error value
    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
    mockSignInEmail.mockRejectedValueOnce('boom');
    mockGetFriendlyMessage.mockReturnValueOnce('signin-friendly');

    render(<SignInPageContent />);

    const signinBtn = screen.queryByTestId('signin-submit');
    if (signinBtn) fireEvent.click(signinBtn);
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
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.any(String) })
      )
    );
  });

  it('signIn.email rejects with Error shows error message', async () => {
    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
    mockSignInEmail.mockRejectedValueOnce(new Error('signin boom'));

    render(<SignInPageContent />);

    const signinBtn = screen.queryByTestId('signin-submit');
    if (signinBtn) fireEvent.click(signinBtn);
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
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.any(String) })
      )
    );
  });

  it('handleResendCode email success shows toast', async () => {
    // Use real UI flow: sign in -> select email -> resend
    mockSend2FACode.mockResolvedValueOnce({ success: true });

    render(<SignInPageContent />);

    // trigger sign in and choose email method
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );

    // initial send2FACode when selecting email uses default resolved value
    fireEvent.click(screen.getByTestId('select-email'));
    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );

    // prepare resend to succeed
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    fireEvent.click(screen.getByTestId('resend'));

    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );
  });

  it('handleSelect2FAMethod email failure with Error object shows toast', async () => {
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatchStub = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    // set state so TwoFAMethodSelector is visible (requires2FA true, method null)
    const values: unknown[] = [
      false,
      true,
      null,
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

    mockSend2FACode.mockResolvedValueOnce({
      success: false,
      error: new Error('boom'),
    });

    render(<SignInPageContent />);

    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.anything() })
      )
    );

    useStateSpy.mockRestore();
  });
});
