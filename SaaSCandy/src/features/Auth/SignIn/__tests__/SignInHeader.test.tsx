import { render, screen } from '@testing-library/react';
import { SignInHeader } from '../SignInHeader';

jest.mock('@/components/ui', () => ({
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

jest.mock('@/utils', () => ({
  signInSchema: jest.requireActual('zod').z.object({
    email: jest.requireActual('zod').z.string().email(),
    password: jest.requireActual('zod').z.string().min(1),
  }),
  extractBreadcrumbs: jest.fn(() => [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Sign In', href: '/signin', isActive: true },
  ]),
}));

describe('SignInHeader', () => {
  it('renders heading with correct text', () => {
    render(<SignInHeader />);
    expect(screen.getByTestId('heading')).toHaveTextContent('Sign In Title');
  });
});
