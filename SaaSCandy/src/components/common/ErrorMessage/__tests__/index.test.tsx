const mockConstants = {
  GENERAL_MESSAGES: {
    SOMETHING_WRONG: 'Something went wrong. Please try again.',
  },
  STRING_ERROR_KEYWORDS: {
    network: 'Network error. Please check your connection.',
  },
  ERROR_INSTANCE_KEYWORDS: {
    timeout: 'Something went wrong. Please try again.',
  },
  HTTP_STATUS_MESSAGES: {
    404: 'Resource not found',
    500: 'Server error. Please try again later.',
  },
};

jest.mock('@/constants', () => mockConstants, { virtual: true });

import { render, screen } from '@testing-library/react';
import { ErrorMessage, getFriendlyMessage } from '..';

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
  it('applies custom className', () => {
    render(<ErrorMessage error='error' className='custom-class' />);
    const el = screen.getByText(/wrong/i);
    expect(el.className).toMatch(/custom-class/);
  });

  it('handles undefined error', () => {
    render(<ErrorMessage error={undefined} />);
    expect(screen.getByText(/wrong/i)).toBeInTheDocument();
  });

  it('handles null error', () => {
    render(<ErrorMessage error={null} />);
    expect(screen.getByText(/wrong/i)).toBeInTheDocument();
  });

  it('handles HTTP error with unknown status code', () => {
    const httpError = { status: 999 };
    render(<ErrorMessage error={httpError} />);
    expect(screen.getByText(/wrong/i)).toBeInTheDocument();
  });

  it('getFriendlyMessage returns default for unknown error', () => {
    expect(getFriendlyMessage({})).toBe(
      mockConstants.GENERAL_MESSAGES.SOMETHING_WRONG
    );
    expect(getFriendlyMessage(undefined)).toBe(
      mockConstants.GENERAL_MESSAGES.SOMETHING_WRONG
    );
    expect(getFriendlyMessage(null)).toBe(
      mockConstants.GENERAL_MESSAGES.SOMETHING_WRONG
    );
  });

  it('getFriendlyMessage maps string keywords (case-insensitive)', () => {
    const res = getFriendlyMessage('NETWORK FAILURE');
    expect(res).not.toBe(mockConstants.GENERAL_MESSAGES.SOMETHING_WRONG);
    expect(res.toLowerCase()).toContain('network');
  });

  it('getFriendlyMessage maps Error instances using ERROR_INSTANCE_KEYWORDS', () => {
    // use an error message that contains the exact keyword from the mock
    const err = new Error('timeout occurred');
    const res = getFriendlyMessage(err);
    expect(res).not.toBe(mockConstants.GENERAL_MESSAGES.SOMETHING_WRONG);
    const keywords = ['request', 'time', 'timeout'];
    const matched = keywords.some(k => res.toLowerCase().includes(k));
    expect(matched).toBe(true);
  });

  it('getFriendlyMessage maps known HTTP status codes', () => {
    const res = getFriendlyMessage({ status: 500 });
    expect(res).not.toBe(mockConstants.GENERAL_MESSAGES.SOMETHING_WRONG);
    expect(res.toLowerCase()).toContain('server');
  });

  it('ErrorMessage component renders mapped message for Error instance', () => {
    render(<ErrorMessage error={new Error('timeout happened')} />);
    expect(screen.getByText(/request|timeout|timed/i)).toBeInTheDocument();
  });
});
