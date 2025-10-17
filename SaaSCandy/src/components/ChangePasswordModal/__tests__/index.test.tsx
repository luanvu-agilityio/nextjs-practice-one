import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePasswordModal from '../index';
import { changePassword } from '@/service';
import { showToast } from '@/components/common';

jest.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: { user: { id: 'test-user-id' } },
  }),
}));

jest.mock('@/service');
jest.mock('@/components/common', () => ({
  Button: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <button {...props}>{children}</button>
  ),
  showToast: jest.fn(),
}));

jest.mock('@/components/common/ErrorMessage', () => ({
  ErrorMessage: ({ customMessage }: { customMessage: string }) => (
    <div>{customMessage}</div>
  ),
}));

jest.mock('@/components/common/InputController', () => ({
  InputController: ({ name, label }: { name: string; label: string }) => (
    <input data-testid={name} placeholder={label} />
  ),
}));

jest.mock('@/components', () => ({
  Dialog: ({
    children,
    open,
  }: { children: React.ReactNode } & Record<string, unknown>) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({
    children,
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <div>{children}</div>
  ),
  DialogHeader: ({
    children,
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <div>{children}</div>
  ),
  DialogTitle: ({
    children,
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <h2>{children}</h2>
  ),
  DialogFooter: ({
    children,
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <div>{children}</div>
  ),
}));

describe('ChangePasswordModal', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    const { container } = render(
      <ChangePasswordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
