import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSession, signOut } from '@/lib/auth-client';
import { AccountPageContent } from '..';
import { showToast } from '@/components/common/Toast';
import { ROUTES, TOAST_MESSAGES } from '@/constants';
import { TOAST_VARIANTS } from '@/types/toast';

// Create a router mock object that will be returned by the `useRouter` mock.
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
};

// Module mocks
jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }));
jest.mock('@/components/common/Toast', () => ({ showToast: jest.fn() }));

// Mock the EditProfileModal and ChangePasswordModal so we can assert open state
jest.mock('@/components/form/EditProfileModal', () => ({
  EditProfileModal: ({
    open,
    onOpenChange,
    onSuccess,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess: () => void;
  }) =>
    open ? (
      <div data-testid='edit-profile-modal'>
        <button onClick={() => onOpenChange(false)}>close</button>
        <button onClick={onSuccess} data-testid='trigger-edit-success'>
          trigger success
        </button>
      </div>
    ) : null,
}));

jest.mock('@/components/form/ChangePasswordModal', () => ({
  ChangePasswordModal: ({
    open,
    onOpenChange,
    onSuccess,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess: () => void;
  }) =>
    open ? (
      <div data-testid='change-password-modal'>
        <button onClick={() => onOpenChange(false)}>close</button>
        <button onClick={onSuccess} data-testid='trigger-password-success'>
          trigger success
        </button>
      </div>
    ) : null,
}));

describe('AccountPageContent Component', () => {
  const mockedUseSession = useSession as jest.MockedFunction<typeof useSession>;
  const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;
  const mockedShowToast = showToast as jest.MockedFunction<typeof showToast>;

  beforeEach(() => {
    jest.clearAllMocks();
    // default: authenticated user
    mockedUseSession.mockReturnValue({
      data: {
        user: { name: 'John Doe', email: 'john@example.com', image: null },
      },
      isPending: false,
    } as unknown as ReturnType<typeof useSession>);
  });

  it('redirects to sign-in when unauthenticated', async () => {
    mockedUseSession.mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof useSession>);

    render(<AccountPageContent />);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.SIGN_IN);
    });
  });

  it('renders user name, email and avatar fallback when image is missing', () => {
    render(<AccountPageContent />);

    // The visible user name is rendered as an h2
    const nameHeading = screen.getByRole('heading', {
      name: 'John Doe',
      level: 2,
    });
    expect(nameHeading).toBeInTheDocument();

    // email appears in at least one place
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);

    // avatar fallback: initial letter should be present
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('calls signOut, navigates home and shows toast on Sign Out', async () => {
    mockedSignOut.mockResolvedValue(undefined as unknown as void);

    const user = userEvent.setup();
    render(<AccountPageContent />);

    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
    await user.click(signOutButton);

    await waitFor(() => {
      expect(mockedSignOut).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.HOME);
      expect(mockRouter.refresh).toHaveBeenCalled();
      expect(mockedShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: TOAST_MESSAGES.ACCOUNT.SIGNOUT_SUCCESS.title,
          variant: TOAST_VARIANTS.SUCCESS,
        })
      );
    });
  });

  it('shows error toast when signOut throws', async () => {
    mockedSignOut.mockRejectedValue(new Error('Sign out failed'));

    const user = userEvent.setup();
    render(<AccountPageContent />);

    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
    await user.click(signOutButton);

    await waitFor(() => {
      expect(mockedShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: TOAST_MESSAGES.ACCOUNT.SIGNOUT_ERROR.title,
          variant: TOAST_VARIANTS.ERROR,
        })
      );
    });
  });

  it('calls router.back when Back button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountPageContent />);

    const backButton = screen.getByRole('button', { name: /Back/i });
    await user.click(backButton);

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('opens Edit Profile modal when Edit Profile is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountPageContent />);

    const editButton = screen.getByRole('button', { name: /Edit Profile/i });
    await user.click(editButton);

    expect(screen.getByTestId('edit-profile-modal')).toBeInTheDocument();
  });

  it('opens Change Password modal when Change Password is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountPageContent />);

    const changeButton = screen.getByRole('button', {
      name: /Change Password/i,
    });
    await user.click(changeButton);

    expect(screen.getByTestId('change-password-modal')).toBeInTheDocument();
  });

  it('renders spinner when session is pending', () => {
    mockedUseSession.mockReturnValue({
      data: null,
      isPending: true,
    } as unknown as ReturnType<typeof useSession>);

    const { container } = render(<AccountPageContent />);

    // Spinner container should be present
    expect(
      container.querySelector('.flex.justify-center.items-center.min-h-screen')
    ).toBeInTheDocument();
    // Main content should not be present
    expect(screen.queryByText('Account Details')).not.toBeInTheDocument();
  });

  it('renders social account UI when user has image', () => {
    mockedUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Jane Social',
          email: 'jane@social.com',
          image: 'https://example.com/avatar.png',
        },
      },
      isPending: false,
    } as unknown as ReturnType<typeof useSession>);

    render(<AccountPageContent />);

    // Social Account badge should be present
    expect(screen.getByText('Social Account')).toBeInTheDocument();

    // Change Password should be disabled
    const changeButton = screen.getByRole('button', {
      name: /Change Password/i,
    });
    expect(changeButton).toBeDisabled();
    expect(
      screen.getByText(/Not available for social accounts/i)
    ).toBeInTheDocument();
  });

  it('shows success toast when Edit Profile succeeds', async () => {
    const user = userEvent.setup();
    render(<AccountPageContent />);

    const editButton = screen.getByRole('button', { name: /Edit Profile/i });
    await user.click(editButton);

    expect(screen.getByTestId('edit-profile-modal')).toBeInTheDocument();

    // Trigger the onSuccess callback
    const triggerButton = screen.getByTestId('trigger-edit-success');
    await user.click(triggerButton);

    expect(mockedShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: TOAST_MESSAGES.ACCOUNT.PROFILE_UPDATE_SUCCESS.title,
        variant: TOAST_VARIANTS.SUCCESS,
      })
    );
  });

  it('shows success toast when Change Password succeeds', async () => {
    const user = userEvent.setup();
    render(<AccountPageContent />);

    const changeButton = screen.getByRole('button', {
      name: /Change Password/i,
    });
    await user.click(changeButton);

    expect(screen.getByTestId('change-password-modal')).toBeInTheDocument();

    // Trigger the onSuccess callback
    const triggerButton = screen.getByTestId('trigger-password-success');
    await user.click(triggerButton);

    expect(mockedShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: TOAST_MESSAGES.ACCOUNT.PASSWORD_CHANGE_SUCCESS.title,
        variant: TOAST_VARIANTS.SUCCESS,
      })
    );
  });
});
