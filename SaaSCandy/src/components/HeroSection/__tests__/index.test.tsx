import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HeroSection from '@/components/HeroSection';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

jest.mock('@/lib/auth-client');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/components/NavBar', () => ({
  __esModule: true,
  default: () => <div data-testid='navbar'>Navbar</div>,
}));

jest.mock('@/components/layout/Header/AuthSectionSkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid='auth-skeleton'>Loading...</div>,
}));

jest.mock('@/components/UserMenu', () => ({
  UserMenu: () => <div data-testid='user-menu'>User Menu</div>,
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();
const mockRefetch = jest.fn();

describe('HeroSection', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);

    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
      refetch: mockRefetch,
      isRefetching: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot when user is not logged in', () => {
      const { container } = render(<HeroSection />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot when user is logged in', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
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
        refetch: mockRefetch,
        isRefetching: false,
      });

      const { container } = render(<HeroSection />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot when session is pending', () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: true,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      const { container } = render(<HeroSection />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Authentication States', () => {
    it('should render Sign In and Sign Up buttons when not authenticated', () => {
      render(<HeroSection />);

      const signInButtons = screen.getAllByText('Sign In');
      const signUpButtons = screen.getAllByText('Sign Up');

      expect(signInButtons.length).toBeGreaterThan(0);
      expect(signUpButtons.length).toBeGreaterThan(0);
    });

    it('should render loading skeleton when session is pending', () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: true,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<HeroSection />);

      expect(screen.getByTestId('auth-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    it('should render UserMenu when user is authenticated', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
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
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<HeroSection />);

      expect(screen.getByTestId('user-menu')).toBeInTheDocument();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Auth Menu', () => {
    it('should toggle mobile auth menu when user icon is clicked', () => {
      render(<HeroSection />);

      const toggleButton = screen.getByLabelText('Toggle auth menu');
      expect(
        screen.queryByRole('link', { name: /sign in/i })
      ).toBeInTheDocument();

      fireEvent.click(toggleButton);

      // Check if dropdown appears (multiple Sign In buttons now visible)
      const signInButtons = screen.getAllByText('Sign In');
      expect(signInButtons.length).toBeGreaterThan(1);
    });

    it('should close mobile auth menu when backdrop is clicked', () => {
      render(<HeroSection />);

      const toggleButton = screen.getByLabelText('Toggle auth menu');
      fireEvent.click(toggleButton);

      // Find and click backdrop
      const backdrop = document.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();

      if (backdrop) {
        fireEvent.click(backdrop);
      }

      // Menu should close - check for single set of buttons
      waitFor(() => {
        const signInButtons = screen.getAllByText('Sign In');
        expect(signInButtons.length).toBe(2); // Desktop + one in closed mobile
      });
    });

    it('should close mobile auth menu when Sign In link is clicked', () => {
      render(<HeroSection />);

      const toggleButton = screen.getByLabelText('Toggle auth menu');
      fireEvent.click(toggleButton);

      // Get all Sign In links and click the one in the dropdown
      const signInLinks = screen.getAllByText('Sign In');
      const dropdownSignIn = signInLinks[signInLinks.length - 1];

      fireEvent.click(dropdownSignIn);

      waitFor(() => {
        const backdrop = document.querySelector('.fixed.inset-0');
        expect(backdrop).not.toBeInTheDocument();
      });
    });

    it('should close mobile auth menu when Sign Up link is clicked', () => {
      render(<HeroSection />);

      const toggleButton = screen.getByLabelText('Toggle auth menu');
      fireEvent.click(toggleButton);

      const signUpLinks = screen.getAllByText('Sign Up');
      const dropdownSignUp = signUpLinks[signUpLinks.length - 1];

      fireEvent.click(dropdownSignUp);

      waitFor(() => {
        const backdrop = document.querySelector('.fixed.inset-0');
        expect(backdrop).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to services page when "Browse our services" button is clicked', () => {
      render(<HeroSection />);

      const browseButton = screen.getByText('Browse our services');
      fireEvent.click(browseButton);

      expect(mockPush).toHaveBeenCalledWith(ROUTES.SERVICES);
    });

    it('should have correct links for Sign In and Sign Up', () => {
      render(<HeroSection />);

      const signInLinks = screen.getAllByRole('link', { name: /sign in/i });
      const signUpLinks = screen.getAllByRole('link', { name: /sign up/i });

      signInLinks.forEach(link => {
        expect(link).toHaveAttribute('href', ROUTES.SIGN_IN);
      });

      signUpLinks.forEach(link => {
        expect(link).toHaveAttribute('href', ROUTES.SIGN_UP);
      });
    });

    it('should have homepage link with logo', () => {
      render(<HeroSection />);

      const logoLink = screen.getByLabelText('Homepage');
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('Content Rendering', () => {
    it('should render main heading text', () => {
      render(<HeroSection />);

      expect(
        screen.getByText('Build Innovative Apps For Your Business')
      ).toBeInTheDocument();
    });

    it('should render subtitle text', () => {
      render(<HeroSection />);

      expect(
        screen.getByText(/Build smarter, move faster, and grow stronger/i)
      ).toBeInTheDocument();
    });

    it('should render hero image with correct attributes', () => {
      render(<HeroSection />);

      const heroImage = screen.getByAltText('Business dashboard stats');
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute('src');
    });

    it('should render navbar component', () => {
      render(<HeroSection />);

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply background image style', () => {
      const { container } = render(<HeroSection />);

      const section = container.querySelector('section');
      expect(section).toHaveStyle({
        backgroundImage: "url('/images/background/homepage.png')",
        backgroundSize: 'cover',
      });
    });

    it('should have proper header structure', () => {
      render(<HeroSection />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('HEADER');
    });

    it('should render with responsive classes', () => {
      const { container } = render(<HeroSection />);

      // Check for responsive padding classes
      const section = container.querySelector('.py-8');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button for mobile auth toggle', () => {
      render(<HeroSection />);

      const toggleButton = screen.getByLabelText('Toggle auth menu');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-label', 'Toggle auth menu');
    });

    it('should have accessible logo link', () => {
      render(<HeroSection />);

      const logoLink = screen.getByLabelText('Homepage');
      expect(logoLink).toBeInTheDocument();
    });

    it('should have screen reader text for logo', () => {
      render(<HeroSection />);

      const srText = screen.getByText('Homepage', { selector: '.sr-only' });
      expect(srText).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle session error state gracefully', () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: new Error('Session error'),
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<HeroSection />);

      // Should still render auth buttons even with error
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should handle missing user data in session', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: null,
          session: null,
        },
        isPending: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      render(<HeroSection />);

      // Should render auth buttons when user is null
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });
});
