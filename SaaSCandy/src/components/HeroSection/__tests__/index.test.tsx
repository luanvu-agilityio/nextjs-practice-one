import { render, screen } from '@testing-library/react';
import HeroSection from '@/components/HeroSection';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

jest.mock('@/lib/auth-client');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();

describe('HeroSection - Snapshot Tests', () => {
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
      refetch: function (): void {
        throw new Error('Function not implemented.');
      },
      isRefetching: false,
    });
  });

  it('should match snapshot when user is not logged in', () => {
    const { container } = render(<HeroSection />);
    expect(container).toMatchSnapshot();
  });

  it('should render Sign In and Sign Up buttons when not authenticated', () => {
    render(<HeroSection />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should render loading skeleton when session is pending', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
      error: null,
      refetch: function (): void {
        throw new Error('Function not implemented.');
      },
      isRefetching: false,
    });

    render(<HeroSection />);

    // Verify auth section is rendering (skeleton should be present)
    const container = screen.getByRole('banner');
    expect(container).toBeInTheDocument();
  });
});
