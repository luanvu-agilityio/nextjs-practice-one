import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../index';

jest.mock('next/link', () => {
  const MockedLink = ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: unknown) => void;
  }) => {
    return (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    );
  };
  MockedLink.displayName = 'MockedLink';
  return { __esModule: true, default: MockedLink };
});

jest.mock('@/constants', () => ({
  ROUTES: {
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
  },
  NAV_LINKS: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
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

  it('clicking a mobile menu link closes the mobile menu', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
    // Open mobile menu
    await user.click(toggleButton);

    // there should be multiple instances (desktop + mobile)
    const servicesLinks = screen.getAllByText('Services');
    expect(servicesLinks.length).toBeGreaterThan(1);

    // Click the mobile one (the one rendered in the dropdown)
    const mobileServicesLink = servicesLinks[servicesLinks.length - 1];
    await user.click(mobileServicesLink);

    // After clicking a mobile link, the menu should close and only the desktop link remains
    expect(screen.getAllByText('Services')).toHaveLength(1);
  });
});
