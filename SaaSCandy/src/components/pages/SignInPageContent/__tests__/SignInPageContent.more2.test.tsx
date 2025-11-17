import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
const mockGetFriendlyMessage = jest.fn(() => undefined);
jest.mock('@/components/common', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
  getFriendlyMessage: (e: unknown) => mockGetFriendlyMessage(e),
}));

// Minimal form mocks
jest.mock('@/components/form', () => ({
  SignInForm: ({ onSubmit }: { onSubmit: () => unknown }) => (
    <div>
      <button data-testid='signin-submit' onClick={() => onSubmit()}>
        Sign In
      </button>
    </div>
  ),
  TwoFactorForm: ({
    onCodeChange,
    onVerify,
    onResend,
  }: {
    onCodeChange?: (e: { target: { value: string } }) => unknown;
    onVerify?: () => unknown;
    onResend?: () => unknown;
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
      <button data-testid='resend' onClick={() => onResend?.()} />
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
      <button data-testid='sms-verify' onClick={() => onVerify?.()} />
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

// simple useForm mock
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (...a: unknown[]) => unknown) => () =>
      fn({ email: 'a@b.com', password: 'P@ssw0rd' }),
    formState: { isSubmitting: false },
  }),
}));

import { SignInPageContent } from '..';

describe('SignInPageContent - more failure branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockResolvedValue({ success: true });
    mockVerify2FACode.mockResolvedValue({ success: true, data: true });
    mockSignInEmail.mockResolvedValue({ error: undefined });
  });

  it('email verify returns success:false -> shows error toast', async () => {
    mockVerify2FACode.mockResolvedValueOnce({ success: false, error: 'bad' });

    render(<SignInPageContent />);
    fireEvent.click(screen.getByTestId('signin-submit'));
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
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('email verify returns data:false -> shows error toast', async () => {
    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: false });

    render(<SignInPageContent />);
    fireEvent.click(screen.getByTestId('signin-submit'));
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
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('sms verify PUT returns success:false -> shows error toast', async () => {
    // seed internal state to sms flow with phone and code
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

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: false, error: 'smsbad' }),
    });

    render(<SignInPageContent />);
    await waitFor(() =>
      expect(screen.getByTestId('sms-verify')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('sms-verify'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    useStateSpy.mockRestore();
  });

  it('resend-sms (POST) returns success:false -> shows toast', async () => {
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

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: false, error: 'resendfail' }),
    });

    render(<SignInPageContent />);
    await waitFor(() =>
      expect(screen.getByTestId('resend-sms')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('resend-sms'));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    useStateSpy.mockRestore();
  });

  it('verify succeeds but signIn.email returns error -> shows toast (post-verify signIn error)', async () => {
    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
    mockSignInEmail.mockResolvedValueOnce({ error: { message: 'signin bad' } });

    render(<SignInPageContent />);
    fireEvent.click(screen.getByTestId('signin-submit'));
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
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });
});
