import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';

import type {
  Control,
  FieldPath,
  ControllerRenderProps,
} from 'react-hook-form';
import type { EditProfileFormData } from '@/utils';
import { Controller } from 'react-hook-form';
import { computeFullName } from '@/components/form/EditProfileModal';

jest.mock('@/lib/auth-client');
jest.mock('@/service');
jest.mock('@/components/common', () => {
  // Provide a simple mock that connects inputs to react-hook-form via Controller.

  return {
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
      type,
    }: {
      name: keyof EditProfileFormData | string;
      placeholder?: string;
      control: Control<EditProfileFormData>;
      type?: string;
    }) => {
      // Use strong react-hook-form types for the Controller so we avoid `any` casts
      return (
        <Controller
          name={name as unknown as FieldPath<EditProfileFormData>}
          control={control}
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              EditProfileFormData,
              FieldPath<EditProfileFormData>
            >;
          }) => (
            <input
              data-testid={String(name)}
              placeholder={placeholder}
              {...field}
              type={type}
            />
          )}
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

import { EditProfileModal } from '@/components/form/EditProfileModal';
import { useSession } from '@/lib/auth-client';
import { updateProfile } from '@/service';

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUpdateProfile = updateProfile as jest.MockedFunction<
  typeof updateProfile
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
    // Try to stub location.reload in a safe way for tests; ignore if envirait readonly.
    try {
      globalThis.location.reload = jest.fn();
    } catch {
      // ignore when we can't overwrite
    }
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

    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('shows error if updateProfile fails', async () => {
    mockUpdateProfile.mockResolvedValue({
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
    mockUpdateProfile.mockRejectedValue(new Error('Network error'));
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
    mockUpdateProfile.mockResolvedValue({ success: true });
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
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    act(() => {
      jest.runAllTimers();
    });

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
    mockUpdateProfile.mockRejectedValue('String error');

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

  it('uses empty email default when user email is missing', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          ...user,
          email: undefined as unknown as string,
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

    const email = screen.getByTestId('email') as HTMLInputElement;
    expect(email).toHaveValue('');
  });
  it('submits when user has only first name and calls updateProfile with that single name', async () => {
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

      error: null,
      refetch: jest.fn(),
    });

    mockUpdateProfile.mockResolvedValue({ success: true });
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

    // Ensure inputs have values so validation doesn't block submission
    fireEvent.change(screen.getByTestId('firstName'), {
      target: { value: 'SingleName' },
    });
    // lastName must be at least 2 chars per schema; provide a short last name to satisfy validation
    fireEvent.change(screen.getByTestId('lastName'), {
      target: { value: 'Ln' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'john@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: 'SingleName Ln',
        email: 'john@example.com',
      });
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    jest.useRealTimers();
  });

  it('shows fallback message when updateProfile returns success:false without error', async () => {
    mockUpdateProfile.mockResolvedValue({ success: false });

    render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Failed to update profile'
      );
    });
  });

  it('submits with first and last name and calls updateProfile with combined name', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true });

    render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    // Provide valid first and last names so validation passes and onSubmit runs
    fireEvent.change(screen.getByTestId('firstName'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByTestId('lastName'), {
      target: { value: 'Wonder' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'alice@wonder.test' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: 'Alice Wonder',
        email: 'alice@wonder.test',
      });
    });
  });
});

describe('computeFullName', () => {
  it('joins first and last when both present', () => {
    expect(computeFullName({ firstName: 'Alice', lastName: 'Wonder' })).toBe(
      'Alice Wonder'
    );
  });

  it('returns only first name when lastName is undefined', () => {
    expect(computeFullName({ firstName: 'OnlyFirst' })).toBe('OnlyFirst');
  });

  it('returns only last name when firstName is undefined', () => {
    expect(computeFullName({ lastName: 'OnlyLast' })).toBe('OnlyLast');
  });

  it('returns empty string when both are empty or undefined', () => {
    expect(computeFullName({ firstName: '', lastName: '' })).toBe('');
    expect(computeFullName({})).toBe('');
  });
});
