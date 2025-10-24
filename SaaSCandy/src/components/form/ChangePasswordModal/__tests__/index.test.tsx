import { render, fireEvent, screen } from '@testing-library/react';
import { ChangePasswordModal } from '../index';

const sessionMock = { user: { id: 'test-user-id' } };
jest.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: sessionMock,
  }),
}));

const mockChangePassword = jest.fn();
jest.mock('@/service', () => ({
  changePassword: (...args: unknown[]) => mockChangePassword(...args),
}));

const mockShowToast = jest.fn();
jest.mock('@/components/common', () => ({
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
  InputController: ({
    name,
    label,
    ...props
  }: { name: string; label: string } & Record<string, unknown>) => (
    <input data-testid={name} placeholder={label} {...props} />
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
});
