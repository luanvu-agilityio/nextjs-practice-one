import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProfileModal } from '@/components/form/EditProfileModal';
import { useSession } from '@/lib/auth-client';
import { updateProfile } from '@/service';

jest.mock('@/lib/auth-client');
jest.mock('@/service');
jest.mock('@/components/common', () => ({
  Button: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <button {...props}>{children}</button>
  ),
  InputController: ({
    name,
    placeholder,
    ...props
  }: { name: string; placeholder: string } & Record<string, unknown>) => (
    <input data-testid={name} placeholder={placeholder} {...props} />
  ),
  ErrorMessage: ({ customMessage }: { customMessage: string }) => (
    <div data-testid='error-message'>{customMessage}</div>
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
  };

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
      isRefetching: false,
    });
    jest.clearAllMocks();
  });

  it('should match snapshot when open', () => {
    const { container } = render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
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

  it('calls onSuccess and onOpenChange on successful profile update', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true });
    const onOpenChange = jest.fn();
    const onSuccess = jest.fn();
    render(
      <EditProfileModal
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
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
    // Wait for setTimeout to call onSuccess and onOpenChange
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
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
});
