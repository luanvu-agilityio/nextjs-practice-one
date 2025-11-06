import { render, screen, fireEvent } from '@testing-library/react';

// mock next/navigation router to capture back() calls
const mockRouterBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockRouterBack }),
}));

import BlogError from '../error';

describe('BlogError', () => {
  const error = new Error('Test error');
  const reset = jest.fn();

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders error message and buttons', () => {
    render(<BlogError error={error} reset={reset} />);
    expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Blog/i)).toBeInTheDocument();
  });

  it('calls reset when Try Again is clicked', () => {
    render(<BlogError error={error} reset={reset} />);
    fireEvent.click(screen.getByText(/Try Again/i));
    expect(reset).toHaveBeenCalled();
  });

  it('renders icon and logs error on mount', () => {
    const { container } = render(<BlogError error={error} reset={reset} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Blog page error:', error);
  });

  it('calls router.back when Back to Blog is clicked', () => {
    render(<BlogError error={error} reset={reset} />);
    fireEvent.click(screen.getByText(/Back to Blog/i));
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  it('shows error details in development mode', () => {
    const original = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'development';
    render(<BlogError error={error} reset={reset} />);
    expect(
      screen.getByText(/Error Details \(Development\)/i)
    ).toBeInTheDocument();
    (process.env as Record<string, string>).NODE_ENV = original;
  });
});
