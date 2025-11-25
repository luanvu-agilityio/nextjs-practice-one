import { render, screen, fireEvent } from '@testing-library/react';
import { PortfolioPageContent } from '@/features/Portfolio';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/constants', () => ({
  docs: [
    { title: 'Getting Started', description: 'Start here' },
    { title: 'API Reference', description: 'API docs' },
  ],
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  ROUTES: {
    SERVICES: '/services',
  },
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();

describe('PortfolioPage - Interactive Tests', () => {
  beforeAll(() => {
    // @ts-expect-error : Mock window.IntersectionObserver
    global.IntersectionObserver = class {
      constructor() {}
      observe() {}
      disconnect() {}
      unobserve() {}
    };
  });
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);
  });

  it('should render features section', () => {
    render(<PortfolioPageContent />);

    expect(screen.getByText('Why choose us')).toBeInTheDocument();
    expect(
      screen.getByText('Top Features That Set Us Apart')
    ).toBeInTheDocument();
  });

  it('should render all features', () => {
    render(<PortfolioPageContent />);

    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Feature 3')).toBeInTheDocument();
  });

  it('should navigate to services when All Services button clicked', () => {
    render(<PortfolioPageContent />);

    const button = screen.getByText('All Services');
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith('/services');
  });

  it('should render documentation section', () => {
    render(<PortfolioPageContent />);

    expect(screen.getByText('Product Docs')).toBeInTheDocument();
    expect(
      screen.getByText('Beautiful Docs for your APIs.')
    ).toBeInTheDocument();
    expect(screen.getByText('Open Portfolio')).toBeInTheDocument();
  });

  it('should render portfolio images', () => {
    render(<PortfolioPageContent />);

    expect(screen.getByAltText('Portfolio 1')).toBeInTheDocument();
    expect(screen.getByAltText('Portfolio 2')).toBeInTheDocument();
  });
});
