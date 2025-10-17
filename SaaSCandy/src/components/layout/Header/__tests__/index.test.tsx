import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../index';
import { JSX } from 'react';

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

jest.mock('@/components/NavBar', () => {
  return function Navbar() {
    return <nav data-testid='navbar'>Navbar</nav>;
  };
});

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
}));

jest.mock('@/components/icons/Logo', () => {
  return function LogoIcon({ className }: { className?: string }) {
    return <svg data-testid='logo-icon' className={className} />;
  };
});

jest.mock('@/components/icons/ThemeSwitcherIcon', () => {
  return function ThemeSwitcherIcon({ className }: { className?: string }) {
    return <svg data-testid='theme-switcher-icon' className={className} />;
  };
});

describe.skip('Header - Snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(<Header />);
    expect(container).toMatchSnapshot();
  });
});

describe.skip('Header - Interactive', () => {
  it('renders navigation buttons and they are clickable', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const signUpButton = screen.getByRole('button', { name: /sign up/i });

    expect(signInButton).toBeInTheDocument();
    expect(signUpButton).toBeInTheDocument();

    await user.click(signInButton);
    await user.click(signUpButton);

    // Verify buttons are interactive (clicks don't throw errors)
    expect(signInButton).toBeInTheDocument();
    expect(signUpButton).toBeInTheDocument();
  });
});
