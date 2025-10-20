import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/layout/Header';
import { useSession } from '@/lib/auth-client';

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
      isRefetching: false,
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

  it('should show loading skeleton when session is pending', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
      error: null,
      refetch: function (): void {
        throw new Error('Function not implemented.');
      },
      isRefetching: false,
    });

    const { container } = render(<Header />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
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
});
