import { render, screen, fireEvent } from '@testing-library/react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useSession } from '@/lib/auth-client';
import { usePathname } from 'next/navigation';

jest.mock('@/lib/auth-client');
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock('@/utils', () => ({
  extractBreadcrumbs: jest.fn(() => [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Services', href: '/services', isActive: true },
  ]),
}));
jest.mock('@/constants', () => ({
  ROUTES: {
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
  },
}));

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
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('PageLayout - Snapshot Tests', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
      refetch: function (): void {
        throw new Error('Function not implemented.');
      },
      isRefetching: false,
    });
    mockUsePathname.mockReturnValue('/services');
  });

  it('should match snapshot', () => {
    const { container } = render(
      <PageLayout title='Test Page' subtitle='Test subtitle'>
        <div>Test Content</div>
      </PageLayout>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render title and subtitle', () => {
    render(
      <PageLayout title='Test Page' subtitle='Test subtitle'>
        <div>Test Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <PageLayout title='Test Page'>
        <div>Test Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

describe('PageLayout - Interactive Tests', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
      refetch: function (): void {
        throw new Error('Function not implemented.');
      },
      isRefetching: false,
    });
    mockUsePathname.mockReturnValue('/services');
  });

  it('should use breadcrumb override when provided', () => {
    const customBreadcrumbs = [
      { label: 'Custom', href: '/custom', isActive: false },
      { label: 'Path', href: '/custom/path', isActive: true },
    ];

    render(
      <PageLayout title='Test Page' breadcrumbOverride={customBreadcrumbs}>
        <div>Test Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('Path')).toBeInTheDocument();
  });

  it('should apply custom className props', () => {
    const { container } = render(
      <PageLayout
        title='Test Page'
        className='custom-wrapper'
        headerClassName='custom-header'
        contentClassName='custom-content'
      >
        <div>Test Content</div>
      </PageLayout>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-wrapper');
  });

  it('should toggle mobile auth dropdown', () => {
    render(
      <PageLayout title='Test Page'>
        <div>Test Content</div>
      </PageLayout>
    );

    const toggleButton = screen.getByLabelText('Toggle auth menu');
    fireEvent.click(toggleButton);

    const backdrop = document.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
  });

  it('should render without subtitle', () => {
    render(
      <PageLayout title='Test Page'>
        <div>Test Content</div>
      </PageLayout>
    );

    expect(screen.getByText('Test Page')).toBeInTheDocument();
    // Subtitle should not be rendered
    const subtitleElement = screen.queryByText('Test subtitle');
    expect(subtitleElement).not.toBeInTheDocument();
  });

  it('should render UserMenu when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
          twoFactorEnabled: undefined,
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
      refetch: function (): void {
        throw new Error('Function not implemented.');
      },
      isRefetching: false,
    });

    render(
      <PageLayout title='Test Page'>
        <div>Test Content</div>
      </PageLayout>
    );

    // UserMenu should be rendered instead of auth buttons
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });
});
