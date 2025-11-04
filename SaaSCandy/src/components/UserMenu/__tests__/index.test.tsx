import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from '@/components/UserMenu';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

jest.mock('@/lib/auth-client');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();
const mockRefresh = jest.fn();

describe('Rendering States', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);

    jest.clearAllMocks();
  });

  it('should render null when session is null', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<UserMenu />);
    expect(container.firstChild).toBeNull();
  });

  it('should render user menu when session exists with user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session: {
          userId: '1',
          expiresAt: new Date(),
          token: 'test-token',
          id: 'session-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '',
          userAgent: '',
        },
      },
      isPending: false,

      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    expect(
      screen.getByRole('button', { name: /user menu/i })
    ).toBeInTheDocument();
  });
});

describe('Display Name and Initials', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);

    jest.clearAllMocks();
  });

  it('should display user name and correct initials when name is provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,

      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByText('Welcome, John')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should display email when name is not provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: '',
          email: 'test@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,

      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should display "User" when neither name nor email is provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: '',
          email: '',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,

      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByText('Welcome, User')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('should handle single name correctly', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,

      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByText('Welcome, Alice')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should handle multi-part names correctly', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Mary Jane Watson',
          email: 'mary@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,

      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByText('Welcome, Mary')).toBeInTheDocument();
    expect(screen.getByText('MJ')).toBeInTheDocument();
  });
});

describe('Avatar Display', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);

    jest.clearAllMocks();
  });

  it('should render user image when image URL is provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: 'https://example.com/avatar.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,

      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    const images = screen.getAllByAltText('Profile');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('should render initials when image URL is not provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,

      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    const initialsElements = screen.getAllByText('JD');
    expect(initialsElements.length).toBeGreaterThan(0);
  });
});

describe('Dropdown Menu Interaction', () => {
  beforeEach(() => {
    return mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should open dropdown menu when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Account Details')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('should display user info in dropdown header', async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('should display all menu items', async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Account Details')).toBeInTheDocument();
      expect(screen.getByText('Settings (Coming Soon)')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('should navigate to account page when Account Details is clicked', async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    await user.click(trigger);

    await waitFor(() => {
      const accountLink = screen.getByText('Account Details').closest('a');
      expect(accountLink).toHaveAttribute('href', ROUTES.ACCOUNT);
    });
  });

  it('should have disabled Settings menu item', async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    await user.click(trigger);

    await waitFor(() => {
      const settingsItem = screen
        .getByText('Settings (Coming Soon)')
        .closest('[role="menuitem"]');
      expect(settingsItem).toHaveAttribute('data-disabled');
    });
  });
});

describe('Custom Styling', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should apply custom className', () => {
    const { container } = render(<UserMenu className='custom-class' />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should apply default empty className when not provided', () => {
    const { container } = render(<UserMenu />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should have accessible button with aria-label', () => {
    render(<UserMenu />);
    const button = screen.getByRole('button', { name: /user menu/i });
    expect(button).toHaveAttribute('aria-label', 'User menu');
  });

  it('should have proper focus styles', () => {
    render(<UserMenu />);
    const button = screen.getByRole('button', { name: /user menu/i });
    expect(button).toHaveClass(
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-orange-background'
    );
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    const button = screen.getByRole('button', { name: /user menu/i });

    // Tab to button
    await user.tab();
    expect(button).toHaveFocus();

    // Press Enter to open menu
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Account Details')).toBeInTheDocument();
    });
  });
});

describe('Snapshot Tests', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);

    jest.clearAllMocks();
  });

  it('should match snapshot with full user data', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: 'https://example.com/avatar.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<UserMenu />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot without user image', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<UserMenu />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with custom className', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<UserMenu className='test-class' />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot when no session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,

      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<UserMenu />);
    expect(container).toMatchSnapshot();
  });
});

describe('Edge Cases', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);

    jest.clearAllMocks();
  });

  it('should handle empty name string', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: '',
          email: 'test@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument();
  });

  it('should handle empty email string', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: '',
          email: '',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByText('Welcome, User')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('should handle very long names gracefully', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Alexander Maximilian Christopher Wellington',
          email: 'alex@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByText('Welcome, Alexander')).toBeInTheDocument();
    expect(screen.getByText('AM')).toBeInTheDocument(); // Only first 2 initials
  });

  it('should handle special characters in name', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: "O'Brien-Smith",
          email: 'obrien@example.com',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session:
          {} as (typeof mockUseSession.mock.results)[0]['value']['data']['session'],
      },
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<UserMenu />);
    expect(screen.getByText("Welcome, O'Brien-Smith")).toBeInTheDocument();
  });
});
