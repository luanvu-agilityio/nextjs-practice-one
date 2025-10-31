import { render, screen } from '@testing-library/react';
import { SignInHeader } from '../SignInHeader';

jest.mock('@/components/common', () => ({
  Heading: ({
    content,
    className,
  }: {
    content: string;
    className?: string;
  }) => (
    <h2 data-testid='heading' className={className}>
      {content}
    </h2>
  ),
}));

jest.mock('@/constants/messages', () => ({
  AUTH_MESSAGES: {
    SIGN_IN: { title: 'Sign In Title' },
  },
}));

describe('SignInHeader', () => {
  it('renders heading with correct text', () => {
    render(<SignInHeader />);
    expect(screen.getByTestId('heading')).toHaveTextContent('Sign In Title');
  });
});
