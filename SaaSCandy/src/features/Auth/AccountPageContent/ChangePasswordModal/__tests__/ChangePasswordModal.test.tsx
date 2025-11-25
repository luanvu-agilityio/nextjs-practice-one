import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useController } from 'react-hook-form';

// Mock common components and hooks
const mockShowToast = jest.fn();

jest.mock('@/components/ui', () => {
  // lightweight typed mocks for shared components used by ChangePasswordModal
  const InputController = ({
    name,
    control,
    ...rest
  }: { name: string; control?: unknown } & Record<string, unknown>) => {
    // Use the real useController so the mocked InputController provides the same field shape
    const { field } = (
      useController as unknown as (opts: {
        name: string;
        control?: unknown;
      }) => { field: Record<string, unknown> }
    )({ name, control });
    // strip non-DOM props to avoid React warnings
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { showPasswordToggle, ...restProps } = rest as Record<
      string,
      unknown
    >;
    return (
      <input
        data-testid={name}
        {...(field as Record<string, unknown>)}
        {...restProps}
      />
    );
  };

  const ErrorMessage = ({ customMessage }: { customMessage?: string }) => (
    <div data-testid='error'>{customMessage}</div>
  );

  const Button = (props: React.ComponentProps<'button'>) => (
    <button {...props} />
  );

  return {
    Button,
    showToast: (...args: unknown[]) => mockShowToast(...args),
    ErrorMessage,
    InputController,
  };
});

// Mock Dialog wrappers to just render children
jest.mock('@/components', () => ({
  Dialog: ({
    children,
    open,
  }: {
    children?: React.ReactNode;
    open?: boolean;
  }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogFooter: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock auth-client useSession
const mockUseSession = jest.fn(() => ({ data: { user: { id: 'u1' } } }));
jest.mock('@/lib/auth-client', () => ({ useSession: () => mockUseSession() }));

// Mock service
jest.mock('@/service', () => {
  const m = jest.fn();
  return { changePassword: m, changePasswordAsync: m };
});

import { ChangePasswordModal } from '..';
import { changePassword } from '@/service';

describe('ChangePasswordModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows error when session user missing', async () => {
    // simulate missing session
    (mockUseSession as jest.Mock).mockReturnValue({ data: undefined });

    const onOpenChange = jest.fn();
    const onSuccess = jest.fn();

    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    // fill valid inputs so validation allows submit to run
    const current = screen.getByTestId('currentPassword');
    const np = screen.getByTestId('newPassword');
    const cp = screen.getByTestId('confirmPassword');

    fireEvent.change(current, { target: { value: 'OldPass1' } });
    fireEvent.change(np, { target: { value: 'NewPass1' } });
    fireEvent.change(cp, { target: { value: 'NewPass1' } });

    const submit = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(submit);

    // since session is missing, changePassword should not be called
    await waitFor(() => expect(changePassword).not.toHaveBeenCalled());
  });

  it('handles success flow', async () => {
    (mockUseSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'u1' } },
    });
    (changePassword as jest.Mock).mockResolvedValue({ success: true });

    const onOpenChange = jest.fn();
    const onSuccess = jest.fn();

    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    const current = screen.getByTestId('currentPassword') as HTMLInputElement;
    const np = screen.getByTestId('newPassword') as HTMLInputElement;
    const cp = screen.getByTestId('confirmPassword') as HTMLInputElement;

    fireEvent.change(current, { target: { value: 'OldPass1' } });
    fireEvent.change(np, { target: { value: 'NewPass1' } });
    fireEvent.change(cp, { target: { value: 'NewPass1' } });

    const changeBtn = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(changeBtn);

    await waitFor(() =>
      expect(changePassword).toHaveBeenCalledWith('OldPass1', 'NewPass1')
    );

    // toast should be called
    expect(mockShowToast).toHaveBeenCalled();

    // advance timers to execute onSuccess and close/reset
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles API error response', async () => {
    (mockUseSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'u1' } },
    });
    (changePassword as jest.Mock).mockResolvedValue({
      success: false,
      error: 'bad',
    });

    const onOpenChange = jest.fn();
    const onSuccess = jest.fn();

    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    const current = screen.getByTestId('currentPassword') as HTMLInputElement;
    const np = screen.getByTestId('newPassword') as HTMLInputElement;
    const cp = screen.getByTestId('confirmPassword') as HTMLInputElement;

    fireEvent.change(current, { target: { value: 'OldPass1' } });
    fireEvent.change(np, { target: { value: 'NewPass1' } });
    fireEvent.change(cp, { target: { value: 'NewPass1' } });

    const changeBtn = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(changeBtn);

    await waitFor(() => expect(changePassword).toHaveBeenCalled());

    expect(screen.getByTestId('error')).toHaveTextContent('bad');
  });

  it('handles thrown exception', async () => {
    (mockUseSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'u1' } },
    });
    (changePassword as jest.Mock).mockRejectedValue(new Error('boom'));

    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={jest.fn()}
        onSuccess={jest.fn()}
      />
    );

    const current = screen.getByTestId('currentPassword') as HTMLInputElement;
    const np = screen.getByTestId('newPassword') as HTMLInputElement;
    const cp = screen.getByTestId('confirmPassword') as HTMLInputElement;

    fireEvent.change(current, { target: { value: 'OldPass1' } });
    fireEvent.change(np, { target: { value: 'NewPass1' } });
    fireEvent.change(cp, { target: { value: 'NewPass1' } });

    const changeBtn = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(changeBtn);

    await waitFor(() => expect(changePassword).toHaveBeenCalled());

    expect(screen.getByTestId('error')).toHaveTextContent('boom');
  });

  it('cancel button closes and resets', async () => {
    (mockUseSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'u1' } },
    });

    const onOpenChange = jest.fn();
    const onSuccess = jest.fn();

    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
