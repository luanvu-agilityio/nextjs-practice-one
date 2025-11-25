import ResetPasswordPageContent from '../index';
import { render, screen } from '@testing-library/react';
import { showToast } from '@/components/ui';

import React from 'react';

const mockPush = jest.fn();
const mockGet = jest.fn();

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/components/ui', () => ({
  showToast: jest.fn(),
  Heading: ({ content, className }: { content: string; className: string }) => (
    <h2 className={className}>{content}</h2>
  ),
}));

jest.mock('../ResetPasswordForm', () => ({
  ResetPasswordForm: ({
    token,
    onSuccess,
  }: {
    token: string;
    onSuccess: () => void;
  }) => (
    <div data-testid='reset-password-form' data-token={token}>
      <button onClick={onSuccess}>Trigger Success</button>
    </div>
  ),
}));

jest.mock('@/constants', () => ({
  ROUTES: {
    SIGN_IN: '/sign-in',
  },
}));

describe('ResetPasswordPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue('test-token-123');
  });

  it('renders heading with correct content', () => {
    render(<ResetPasswordPageContent />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Reset Password'
    );
  });

  it('renders ResetPasswordForm component', () => {
    render(<ResetPasswordPageContent />);

    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
  });

  it('passes token from URL params to ResetPasswordForm', () => {
    render(<ResetPasswordPageContent />);

    const form = screen.getByTestId('reset-password-form');
    expect(form).toHaveAttribute('data-token', 'test-token-123');
  });

  it('passes empty string token when no token in URL', () => {
    mockGet.mockReturnValue(null);

    render(<ResetPasswordPageContent />);

    const form = screen.getByTestId('reset-password-form');
    expect(form).toHaveAttribute('data-token', '');
  });

  it('has correct container styling', () => {
    const { container } = render(<ResetPasswordPageContent />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      'max-w-md',
      'mx-auto',
      'bg-white',
      'p-6',
      'rounded-lg',
      'shadow-sm'
    );
  });

  it('heading has correct styling', () => {
    render(<ResetPasswordPageContent />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('mb-4');
  });

  it('calls showToast and navigates to sign-in on successful reset', () => {
    render(<ResetPasswordPageContent />);

    // Trigger the mocked form's onSuccess handler
    const trigger = screen.getByText('Trigger Success');
    trigger.click();

    expect(showToast).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });
});
