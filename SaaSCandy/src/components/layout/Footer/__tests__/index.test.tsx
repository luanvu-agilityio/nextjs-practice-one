import { JSX } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from '../index';

jest.mock('next/link', () => {
  const MockedLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  MockedLink.displayName = 'MockedLink';
  return MockedLink;
});

// Mock components
jest.mock('@/components/common', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  }) => <button {...props}>{children}</button>,
  Heading: ({
    content,
    as,
    ...props
  }: {
    content: string;
    as?: keyof JSX.IntrinsicElements;
    [key: string]: unknown;
  }) => {
    const Tag = as || 'h1';
    return <Tag {...props}>{content}</Tag>;
  },
  IconButton: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  }) => <button {...props}>{children}</button>,
  Typography: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <p className={className}>{children}</p>,
}));

jest.mock('@/components/icons/Logo', () => {
  return function LogoIcon({ className }: { className?: string }) {
    return <svg data-testid='logo-icon' className={className} />;
  };
});

// Mock constants
jest.mock('@/constants', () => ({
  NAV_LINKS: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
  SOCIAL_LINKS: [
    {
      href: 'https://facebook.com',
      icon: () => <svg data-testid='facebook-icon' />,
    },
    {
      href: 'https://twitter.com',
      icon: () => <svg data-testid='twitter-icon' />,
    },
  ],
}));

describe('Footer - Snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(<Footer />);
    expect(container).toMatchSnapshot();
  });
});

describe('Footer - Interactive', () => {
  it('submits email subscription form', async () => {
    const user = userEvent.setup();
    render(<Footer />);

    const emailInput = screen.getByPlaceholderText(/enter email address/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');

    await user.click(registerButton);
  });
});
