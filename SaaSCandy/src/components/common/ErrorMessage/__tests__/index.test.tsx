const mockConstants = {
  GENERAL_MESSAGES: { SOMETHING_WRONG: 'Something went wrong' },
  STRING_ERROR_KEYWORDS: { network: 'Network error occurred' },
  ERROR_INSTANCE_KEYWORDS: { timeout: 'Request timed out' },
  HTTP_STATUS_MESSAGES: { 404: 'Resource not found', 500: 'Server error' },
};

jest.mock('@/constants', () => mockConstants, { virtual: true });

import { render, screen } from '@testing-library/react';
import { ErrorMessage } from '..';

describe('ErrorMessage Component', () => {
  it('matches snapshot with default error', () => {
    const { container } = render(
      <ErrorMessage error={new Error('Test error')} />
    );
    expect(container).toMatchSnapshot();
  });

  it('displays custom message when provided', () => {
    render(<ErrorMessage customMessage='Custom error message' />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('handles string error', () => {
    render(<ErrorMessage error='network failure' />);
    expect(screen.getByText(/network|wrong/i)).toBeInTheDocument();
  });

  it('handles HTTP error with status code', () => {
    const httpError = { status: 404 };
    render(<ErrorMessage error={httpError} />);
    expect(screen.getByText(/not found|wrong/i)).toBeInTheDocument();
  });
});
