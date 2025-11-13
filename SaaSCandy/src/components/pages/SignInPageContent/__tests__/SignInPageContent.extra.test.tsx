import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

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
  Sms2FAForm: ({ onVerify }: { onVerify?: () => unknown }) => (
    <div>
      <button data-testid='sms-verify' onClick={() => onVerify?.()}>
        SMS Verify
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

    // provide a messy value: letters and >6 digits by calling the captured handler inside act
    await act(async () => {
      (capturedOnCodeChange as (e: { target: { value: string } }) => unknown)?.(
        {
          target: { value: '12a34567890' },
        }
      );
      // call verify inside act to avoid async act warnings
      (capturedOnVerify as () => unknown)?.();
    });

    await waitFor(() =>
      expect(mockVerify2FACode).toHaveBeenCalledWith('a@b.com', '123456')
    );
    await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
    await waitFor(() => expect(push).toHaveBeenCalled());
  });
});
