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

const push = jest.fn();
const refresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => '/signin',
  useSearchParams: () => ({ get: () => null }),
}));

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
    </div>
  ),
  TwoFactorForm: ({
    onCodeChange,
    onVerify,
  }: {
    onCodeChange?: (e: { target: { value: string } }) => unknown;
    onVerify?: () => unknown;
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
      <button data-testid='verify' onClick={() => onVerify?.()} />
    </div>
  ),
  Sms2FAForm: ({ onVerify }: { onVerify?: () => unknown }) => (
    <div>
      <button data-testid='sms-verify' onClick={() => onVerify?.()} />
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
jest.mock('../SignInFooter', () => ({ SignInFooter: () => <div>Footer</div> }));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (data: unknown) => unknown) => () =>
      fn({ email: 'a@b.com', password: 'P@ssw0rd' }),
    formState: { isSubmitting: false },
  }),
}));

import { SignInPageContent } from '..';

describe('SignInPageContent extra2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockResolvedValue({ success: true });
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
  });

  it('sanitizes input and verifies', async () => {
    render(<SignInPageContent />);
    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    // change input with letters and extra digits
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

  it('shows toast when SMS send fails', async () => {
    // prepare useState to include phone so SMS flow proceeds
    const useStateSpy = jest.spyOn(React, 'useState') as jest.SpyInstance;
    const dispatchStub = (() => undefined) as React.Dispatch<
      React.SetStateAction<unknown>
    >;
    const values: unknown[] = [
      false,
      true,
      null,
      '',
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
      json: async () => ({ success: false, error: 'sms fail' }),
    });

    render(<SignInPageContent />);
    // component mounts with requires2FA === true (from our useState mock), so TwoFAMethodSelector is shown
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );

    // call sms verify handler via button on TwoFAMethodSelector
    fireEvent.click(screen.getByTestId('sms-verify-btn'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    useStateSpy.mockRestore();
  });
});
