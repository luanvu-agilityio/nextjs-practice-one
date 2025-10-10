import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../index';

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

// Mock constants
jest.mock('@/constants', () => ({
  NAV_LINKS: [
    { href: '/home', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
}));

describe('Navbar - Snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(<Navbar />);
    expect(container).toMatchSnapshot();
  });
});

describe('Navbar - Interactive', () => {
  it('toggles mobile menu on button click', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const toggleButton = screen.getByRole('button', { name: /toggle menu/i });

    // Click to open menu
    await user.click(toggleButton);

    // Menu links should now be visible
    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(screen.getAllByText('About')).toHaveLength(2);

    // Click to close menu
    await user.click(toggleButton);

    // Only desktop link remains (hidden on mobile with CSS)
    expect(screen.getAllByText('Home')).toHaveLength(1);
  });
});
