import { render, screen, fireEvent } from '@testing-library/react';
import BlogError from '@/app/(dashboard)/blog/error';

describe('BlogError - Interactive Tests', () => {
  const mockError = new Error('Test error message');
  const mockReset = jest.fn();

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should render error message and buttons', () => {
    render(<BlogError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an error while loading the blog content/)
    ).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Back to Blog')).toBeInTheDocument();
  });

  it('should call reset when Try Again button is clicked', () => {
    render(<BlogError error={mockError} reset={mockReset} />);

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should render error icon', () => {
    const { container } = render(
      <BlogError error={mockError} reset={mockReset} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-red-600');
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'development';

    render(<BlogError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();

    (process.env as Record<string, string>).NODE_ENV = originalEnv;
  });
});
