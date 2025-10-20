import { render, screen } from '@testing-library/react';
import EditProfileModal from '@/components/EditProfileModal';
import { useSession } from '@/lib/auth-client';

jest.mock('@/lib/auth-client');
jest.mock('@/service');

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('EditProfileModal - Snapshot Tests', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '123',
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
  });

  it('should populate form with user data', () => {
    render(
      <EditProfileModal
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    const firstNameInput = screen.getByPlaceholderText(
      'Enter first name'
    ) as HTMLInputElement;
    const lastNameInput = screen.getByPlaceholderText(
      'Enter last name'
    ) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(
      'Enter email address'
    ) as HTMLInputElement;

    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
    expect(emailInput.value).toBe('john@example.com');
  });
});
