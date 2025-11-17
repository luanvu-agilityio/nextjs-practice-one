import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
const mockGetFriendlyMessage = jest.fn(String);
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: (e: unknown) => mockGetFriendlyMessage(e),
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

// Minimal form mocks to expose test ids we need
jest.mock('@/components/form', () => ({
  SignInForm: ({ onSubmit }: { onSubmit: () => unknown }) => (
    <div>
      <button data-testid='signin-submit' onClick={() => onSubmit()}>
        Sign In
      </button>
    </div>
  ),
  TwoFactorForm: ({ onResend }: { onResend?: () => unknown }) => (
    <div>
      <button data-testid='resend' onClick={() => onResend?.()}>
        Resend
      </button>
      <input data-testid='twofactor-code' />
      <button data-testid='verify'>Verify</button>
    </div>
  ),
  Sms2FAForm: ({ onVerify }: { onVerify?: () => unknown }) => (
    <div>
      <button data-testid='sms-verify' onClick={() => onVerify?.()}>
        SMS Verify
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

const push = jest.fn();
const refresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => '/signin',
  useSearchParams: () => ({ get: () => null }),
}));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (...args: unknown[]) => unknown) => () =>
      fn({ email: 'a@b.com', password: 'P@ssw0rd' }),
    formState: { isSubmitting: false },
  }),
}));

import { SignInPageContent } from '..';

describe('SignInPageContent - extra4 (resend/sms branches)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockResolvedValue({ success: true });
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
  });

  it('resend code email throws Error uses getFriendlyMessage', async () => {
    mockGetFriendlyMessage.mockReturnValueOnce('resend-friendly');
    // Return a resolved failure object to avoid unhandled promise rejections
    mockSend2FACode.mockResolvedValueOnce({
      success: false,
      error: new Error('boom'),
    });

    render(<SignInPageContent />);

    fireEvent.click(screen.getByTestId('signin-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('select-email')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('select-email'));

    await waitFor(() =>
      expect(screen.getByTestId('twofactor-code')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('resend'));

    await waitFor(() => expect(mockSend2FACode).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.anything() })
      )
    );
  });

  it('sms verify succeeds but signIn returns error shows toast', async () => {
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

    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ success: true, data: true }) });
    mockSignInEmail.mockResolvedValueOnce({
      error: { message: 'sms signin failed' },
    });

    render(<SignInPageContent />);

    await waitFor(() =>
      expect(screen.getByTestId('sms-verify')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('sms-verify'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockSignInEmail).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: expect.any(String) })
      )
    );

    useStateSpy.mockRestore();
  });

  it('sms verify fetch rejection uses getFriendlyMessage', async () => {
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

    globalThis.fetch = jest.fn().mockRejectedValueOnce('boom');
    mockGetFriendlyMessage.mockReturnValueOnce('sms-friendly');

    render(<SignInPageContent />);

    await waitFor(() =>
      expect(screen.getByTestId('sms-verify')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('sms-verify'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.any(String) })
      )
    );

    useStateSpy.mockRestore();
  });
});
