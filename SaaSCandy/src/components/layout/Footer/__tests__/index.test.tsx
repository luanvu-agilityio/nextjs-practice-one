import { fireEvent, render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';

jest.mock('@/constants', () => ({
  NAV_LINKS: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
  SOCIAL_LINKS: [
    { href: 'https://facebook.com', icon: () => <div>Facebook</div> },
    { href: 'https://twitter.com', icon: () => <div>Twitter</div> },
  ],
}));

describe('Footer - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<Footer />);
    expect(container).toMatchSnapshot();
  });

  it('should render brand section with logo and contact info', () => {
    render(<Footer />);

    expect(screen.getByText(/SaaS/)).toBeInTheDocument();
    expect(screen.getByText(/Candy/)).toBeInTheDocument();
    expect(screen.getByText('1989 Don Jackson Lane')).toBeInTheDocument();
    expect(screen.getByText('808-956-9599')).toBeInTheDocument();
  });

  it('should render copyright with current year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(currentYear.toString()))
    ).toBeInTheDocument();
  });

  it('should render fixed CTA button', () => {
    render(<Footer />);

    expect(screen.getByText(/Get Template/)).toBeInTheDocument();
  });
});

jest.mock('@/constants', () => ({
  NAV_LINKS: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
  SOCIAL_LINKS: [
    { href: 'https://facebook.com', icon: () => <div>Facebook</div> },
    { href: 'https://twitter.com', icon: () => <div>Twitter</div> },
  ],
}));

describe('Footer - Interactive Tests', () => {
  it('should toggle services section on mobile', () => {
    render(<Footer />);

    const servicesButton = screen.getAllByText('Services')[0];

    // Click to open
    fireEvent.click(servicesButton);
    expect(screen.getByText('EdTech Apps')).toBeInTheDocument();
  });

  it('should toggle company section on mobile', () => {
    render(<Footer />);

    const companyButtons = screen.getAllByText('Company');
    const mobileButton = companyButtons[0];

    // Click to open
    fireEvent.click(mobileButton);
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('should toggle subscribe section on mobile', () => {
    render(<Footer />);

    const subscribeButton = screen.getAllByText('Subscribe')[0];

    // Click to open
    fireEvent.click(subscribeButton);
    expect(
      screen.getByPlaceholderText('Enter email address')
    ).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should render service links', () => {
    render(<Footer />);

    expect(screen.getAllByText('EdTech Apps').length).toBeGreaterThan(0);
    expect(screen.getAllByText('eCommerce Apps').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CRM Apps').length).toBeGreaterThan(0);
  });

  it('should render social links', () => {
    render(<Footer />);

    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
  });
});
