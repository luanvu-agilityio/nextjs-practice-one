import { render, screen, fireEvent } from '@testing-library/react';
import BlogError from '../error';

describe('BlogError', () => {
  const error = new Error('Test error');
  const reset = jest.fn();

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
});
