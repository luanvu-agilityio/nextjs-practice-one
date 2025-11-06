import { render, screen, fireEvent } from '@testing-library/react';
import { useSession } from '@/lib/auth-client';
// Mock UserMenu so authenticated branch is easy to assert
jest.mock('@/components/UserMenu', () => ({
  UserMenu: () => <div data-testid='user-menu'>user-menu</div>,
}));
import { Header } from '@/components/layout/Header';

jest.mock('@/lib/auth-client');
jest.mock('@/constants', () => ({
  ROUTES: {
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
  },
  NAV_LINKS: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
  ],
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('Header - Interactive Tests', () => {
  beforeEach(() => {
    return mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
      refetch: function (): void {
        throw new Error('Function not implemented.');
      },
    });
  });

  it('should render logo and brand name', () => {
    render(<Header />);

    expect(screen.getByText(/SaaS/)).toBeInTheDocument();
    expect(screen.getByText(/Candy/)).toBeInTheDocument();
  });

  it('should render auth buttons when not authenticated', () => {
    render(<Header />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should toggle mobile auth menu', () => {
    render(<Header />);

    const toggleButton = screen.getByLabelText('Toggle auth menu');

    // Click to open
    fireEvent.click(toggleButton);

    // Mobile dropdown should appear (check for backdrop)
    const backdrop = document.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
  });

  it('should close mobile menu when backdrop clicked', () => {
    render(<Header />);

    const toggleButton = screen.getByLabelText('Toggle auth menu');
    fireEvent.click(toggleButton);

    const backdrop = document.querySelector('.fixed.inset-0') as HTMLElement;
    fireEvent.click(backdrop);

    // Menu should be closed
    expect(document.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
  });

  it('should render UserMenu when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Auth User',
          createdAt: new Date(),
          updatedAt: new Date(),
          email: '',
          emailVerified: false,
          twoFactorEnabled: undefined,
        },
        session: {
          id: 'sess-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: '1',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
          token: 'mock-token',
          ipAddress: null,
          userAgent: null,
        },
      },
      isPending: false,
      error: null,
      refetch: function (): void {
        throw new Error('Function not implemented.');
      },
    });

    render(<Header />);

    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    // Auth buttons should not be visible when authenticated
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
  });

  it('clicking Sign In link in mobile menu closes the menu', () => {
    render(<Header />);

    const toggleButton = screen.getByLabelText('Toggle auth menu');
    fireEvent.click(toggleButton);

    // IconButton should have active class when open
    expect(toggleButton.className).toContain('bg-gray-100');

    const dropdown = document.querySelector('.absolute.right-0.top-full');
    expect(dropdown).toBeInTheDocument();

    const signInLink = dropdown?.querySelector(
      'a[href="/signin"]'
    ) as HTMLAnchorElement | null;
    expect(signInLink).toBeTruthy();
    if (signInLink) fireEvent.click(signInLink);

    expect(document.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
    expect(
      document.querySelector('.absolute.right-0.top-full')
    ).not.toBeInTheDocument();
  });

  it('clicking Sign Up link in mobile menu closes the menu', () => {
    render(<Header />);

    const toggleButton = screen.getByLabelText('Toggle auth menu');
    fireEvent.click(toggleButton);

    const dropdown = document.querySelector('.absolute.right-0.top-full');
    expect(dropdown).toBeInTheDocument();

    const signUpLink = dropdown?.querySelector(
      'a[href="/signup"]'
    ) as HTMLAnchorElement | null;
    expect(signUpLink).toBeTruthy();
    if (signUpLink) fireEvent.click(signUpLink);

    expect(document.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
    expect(
      document.querySelector('.absolute.right-0.top-full')
    ).not.toBeInTheDocument();
  });
});
