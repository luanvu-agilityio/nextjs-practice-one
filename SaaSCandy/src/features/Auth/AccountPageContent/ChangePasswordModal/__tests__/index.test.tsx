import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { useController } from 'react-hook-form';

// Mock Effect Schema resolver to bypass validation in tests
jest.mock('@/utils/effect-schema-resolver', () => ({
  effectSchemaResolver: () => (values: unknown) => ({
    values,
    errors: {} as Record<string, unknown>,
  }),
}));

import { ChangePasswordModal } from '../index';

const sessionMock: { user?: { id: string } | undefined } = {
  user: { id: 'test-user-id' },
};
jest.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: sessionMock,
  }),
}));

const mockChangePassword = jest.fn();
jest.mock('@/service', () => ({
  changePassword: (...args: unknown[]) => mockChangePassword(...args),
  changePasswordAsync: (...args: unknown[]) => mockChangePassword(...args),
}));

const mockShowToast = jest.fn();
jest.mock('@/components/ui', () => {
  const InputController = ({
    name,
    control,
    ...rest
  }: { name: string; control?: unknown } & Record<string, unknown>) => {
    const { field } = (
      useController as unknown as (opts: {
        name: string;
        control?: unknown;
      }) => {
        field: Record<string, unknown>;
      }
    )({ name, control });

    // Strip non-DOM props to avoid React warnings
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

  return {
    Button: ({
      children,
      ...props
    }: { children: React.ReactNode } & Record<string, unknown>) => (
      <button {...props}>{children}</button>
    ),
    showToast: (...args: unknown[]) => mockShowToast(...args),
    ErrorMessage: ({ customMessage }: { customMessage: string }) => (
      <div data-testid='error-message'>{customMessage}</div>
    ),
    InputController,
  };
});

jest.mock('@/components', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid='dialog'>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('ChangePasswordModal', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockChangePassword.mockReset();
    mockShowToast.mockReset();
  });

  it('renders correctly when open', () => {
    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter current password')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter new password')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Confirm new password')
    ).toBeInTheDocument();
    screen.getAllByText('Change Password').forEach(element => {
      expect(element).toBeInTheDocument();
    });
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    const { queryByTestId } = render(
      <ChangePasswordModal
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    expect(queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange and resets on cancel', () => {
    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('submits and triggers success flow (toast, onSuccess, onOpenChange after timeout)', async () => {
    jest.useFakeTimers();

    mockChangePassword.mockResolvedValueOnce({ success: true });

    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // submit with default values
    const formEl = screen
      .getByPlaceholderText('Enter current password')
      .closest('form') as HTMLFormElement;
    fireEvent.submit(formEl);

    // wait for the async changePassword and showToast to be called
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    // advance timers to run the setTimeout callback
    jest.runAllTimers();

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);

    jest.useRealTimers();
  });

  it('shows error when changePassword returns success:false', async () => {
    mockChangePassword.mockResolvedValueOnce({
      success: false,
      error: 'Bad request',
    });

    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const formEl = screen
      .getByPlaceholderText('Enter current password')
      .closest('form') as HTMLFormElement;
    fireEvent.submit(formEl);

    const err = await screen.findByTestId('error-message');
    expect(err).toHaveTextContent('Bad request');
  });

  it('shows error when changePassword throws', async () => {
    mockChangePassword.mockRejectedValueOnce(new Error('network fail'));

    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const formEl = screen
      .getByPlaceholderText('Enter current password')
      .closest('form') as HTMLFormElement;
    fireEvent.submit(formEl);

    const err = await screen.findByTestId('error-message');
    expect(err).toHaveTextContent('network fail');
  });

  it('sets error when user session is missing', async () => {
    // Temporarily remove user id
    const originalUser = sessionMock.user;
    sessionMock.user = undefined;

    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const formEl = screen
      .getByPlaceholderText('Enter current password')
      .closest('form') as HTMLFormElement;
    fireEvent.submit(formEl);

    const err = await screen.findByTestId('error-message');
    expect(err).toHaveTextContent('User session not found');

    // restore
    sessionMock.user = originalUser;
  });
  it('renders correctly when open', () => {
    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter current password')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter new password')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Confirm new password')
    ).toBeInTheDocument();
    screen.getAllByText('Change Password').forEach(element => {
      expect(element).toBeInTheDocument();
    });
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    const { queryByTestId } = render(
      <ChangePasswordModal
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    expect(queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange and resets on cancel', () => {
    render(
      <ChangePasswordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
