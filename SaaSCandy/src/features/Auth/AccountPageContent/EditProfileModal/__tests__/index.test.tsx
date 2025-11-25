import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('@/lib/auth-client');
jest.mock('@/service');

jest.mock('@/components/ui', () => ({
  Button: ({
    children,
    ...rest
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <button {...(rest as unknown as Record<string, unknown>)}>
      {children}
    </button>
  ),
  InputController: ({
    name,
    placeholder,
    control,
  }: {
    name: string;
    placeholder?: string;
    control: {
      _formState: { defaultValues: Record<string, string> };
      register: (name: string) => Record<string, unknown>;
    };
  }) => {
    const value = control?._formState?.defaultValues?.[name] || '';
    return (
      <input
        data-testid={name}
        placeholder={placeholder}
        defaultValue={value}
      />
    );
  },
  ErrorMessage: (props: {
    children?: React.ReactNode;
    customMessage?: string;
    message?: string;
    error?: string;
  }) => (
    <div data-testid='error-message'>
      {props.children ??
        props.customMessage ??
        props.message ??
        props.error ??
        ''}
    </div>
  ),
}));

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

import { EditProfileModal } from '..';
import { useSession } from '@/lib/auth-client';
import { updateProfileAsync } from '@/service';

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

const mockUpdateProfileAsync =
  updateProfileAsync as unknown as jest.MockedFunction<
    typeof updateProfileAsync
  >;

describe('EditProfileModal', () => {
  const user = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: false,
    twoFactorEnabled: undefined,
    image: null,
  } as const;

  beforeAll(() => {
    // Mock window.location.reload for all tests
    const locationReload = jest.fn();
    delete (window as { location?: Location }).location;
    (window as { location: Partial<Location> }).location = {
      reload: locationReload,
    };
  });

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user,
        session: {
          id: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: '',
          expiresAt: new Date(),
          token: '',
        },
      },
      isPending: false,
      isRefetching: false,
      error: null,
      refetch: jest.fn(),
    });
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    const { queryByTestId } = render(
      <EditProfileModal
        open={false}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );
    expect(queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('shows error when user session not found', async () => {
    // Return a session with a user object that has no id
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: undefined as unknown as string,
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
          image: null,
        },
        session: {
          id: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: '',
          expiresAt: new Date(),
          token: '',
        },
      },
      isPending: false,
      isRefetching: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    // Fill the fields and submit
    fireEvent.change(screen.getByTestId('firstName'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByTestId('lastName'), {
      target: { value: 'Smith' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'jane@smith.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'User session not found'
      );
    });

    expect(mockUpdateProfileAsync).not.toHaveBeenCalled();
  });

  it('shows error if updateProfile fails', async () => {
    mockUpdateProfileAsync.mockResolvedValue({
      success: false,
      error: 'Bad update',
    });
    render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    fireEvent.change(screen.getByTestId('firstName'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByTestId('lastName'), {
      target: { value: 'Smith' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'jane@smith.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Bad update'
      );
    });
  });

  it('shows error if updateProfile throws', async () => {
    mockUpdateProfileAsync.mockRejectedValue(new Error('Network error'));
    render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    fireEvent.change(screen.getByTestId('firstName'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByTestId('lastName'), {
      target: { value: 'Smith' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'jane@smith.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Network error'
      );
    });
  });

  it('calls onSuccess and onOpenChange on successful profile update (and reloads)', async () => {
    mockUpdateProfileAsync.mockResolvedValue({ success: true });
    const onOpenChange = jest.fn();
    const onSuccess = jest.fn();

    jest.useFakeTimers();

    render(
      <EditProfileModal
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    // Submit the form with default values (John Doe, john@example.com)
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    // Wait for the async operation
    await waitFor(() => {
      expect(mockUpdateProfileAsync).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    jest.runAllTimers();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    jest.useRealTimers();
  });

  it('calls onOpenChange and resets on cancel', () => {
    const onOpenChange = jest.fn();
    render(
      <EditProfileModal
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles user with only first name', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          ...user,
          name: 'SingleName',
        },
        session: {
          id: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: '',
          expiresAt: new Date(),
          token: '',
        },
      },
      isPending: false,
      isRefetching: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.getByTestId('firstName')).toBeInTheDocument();
  });

  it('handles user with empty name', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          ...user,
          name: '',
        },
        session: {
          id: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: '',
          expiresAt: new Date(),
          token: '',
        },
      },
      isPending: false,
      isRefetching: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.getByTestId('firstName')).toBeInTheDocument();
  });

  it('shows generic error message for non-Error exceptions', async () => {
    mockUpdateProfileAsync.mockRejectedValue('String error');

    render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    fireEvent.change(screen.getByTestId('firstName'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByTestId('lastName'), {
      target: { value: 'Smith' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'jane@smith.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Failed to update profile'
      );
    });
  });
});
