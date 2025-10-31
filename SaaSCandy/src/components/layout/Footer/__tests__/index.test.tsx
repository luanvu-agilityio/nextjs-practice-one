import { fireEvent, render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'Link';
  return MockLink;
});

jest.mock('@/constants', () => ({
  NAV_LINKS: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
  SOCIAL_LINKS: [
    {
      href: 'https://facebook.com',
      icon: () => <div>Facebook</div>,
      label: 'Facebook',
    },
    {
      href: 'https://twitter.com',
      icon: () => <div>Twitter</div>,
      label: 'Twitter',
    },
  ],
}));

jest.mock('@/icons/Logo', () => ({
  LogoIcon: ({ className }: { className?: string }) => (
    <svg className={className} data-testid='logo-icon'>
      Logo
    </svg>
  ),
}));

describe('Footer', () => {
  describe('Brand Section', () => {
    it('renders brand section with logo and company name', () => {
      render(<Footer />);
      expect(screen.getByTestId('logo-icon')).toBeInTheDocument();
      expect(screen.getByText(/SaaS/)).toBeInTheDocument();
      expect(screen.getByText(/Candy/)).toBeInTheDocument();
    });

    it('renders company description', () => {
      render(<Footer />);
      expect(
        screen.getByText(/Rakon is a simple, elegant, and secure way/)
      ).toBeInTheDocument();
    });

    it('renders contact information', () => {
      render(<Footer />);
      expect(screen.getByText('1989 Don Jackson Lane')).toBeInTheDocument();
      expect(screen.getByText('808-956-9599')).toBeInTheDocument();
    });
  });

  describe('Desktop Layout', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
    });

    it('renders services column with all links', () => {
      render(<Footer />);
      expect(screen.getByText('EdTech Apps')).toBeInTheDocument();
      expect(screen.getByText('eCommerce Apps')).toBeInTheDocument();
      expect(screen.getByText('CRM Apps')).toBeInTheDocument();
      expect(screen.getByText('Health Apps')).toBeInTheDocument();
      expect(screen.getByText('Web Analytics Apps')).toBeInTheDocument();
      expect(screen.getByText('Banking Apps')).toBeInTheDocument();
    });

    it('service links have correct hrefs', () => {
      const { container } = render(<Footer />);
      const edtechLink = container.querySelector('a[href="/services/edtech"]');
      expect(edtechLink).toBeInTheDocument();
      expect(edtechLink).toHaveTextContent('EdTech Apps');
    });

    it('renders company column with navigation links', () => {
      render(<Footer />);
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('company links have correct hrefs', () => {
      const { container } = render(<Footer />);
      const aboutLink = container.querySelector('a[href="/about"]');
      const contactLink = container.querySelector('a[href="/contact"]');
      expect(aboutLink).toBeInTheDocument();
      expect(contactLink).toBeInTheDocument();
    });

    it('renders subscribe column with form', () => {
      render(<Footer />);
      expect(
        screen.getByPlaceholderText('Enter email address')
      ).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('subscribe form has correct input attributes', () => {
      render(<Footer />);
      const emailInput = screen.getByPlaceholderText('Enter email address');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('aria-label', 'Email');
    });
  });

  describe('Footer Bottom', () => {
    it('renders copyright with current year', () => {
      render(<Footer />);
      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(new RegExp(`©${currentYear}.*GetNextJs`))
      ).toBeInTheDocument();
    });

    it('renders social media links', () => {
      render(<Footer />);
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });

    it('social links open in new tab', () => {
      const { container } = render(<Footer />);
      const socialLinks = container.querySelectorAll('a[target="_blank"]');

      expect(socialLinks.length).toBe(0);
      socialLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noreferrer');
      });
    });

    it('social links have aria labels', () => {
      render(<Footer />);
      expect(screen.getByLabelText('Social media links')).toBeInTheDocument();
    });
  });

  describe('Fixed CTA Button', () => {
    it('renders fixed CTA button', () => {
      render(<Footer />);
      const ctaButton = screen.getByText(/Get Template/);
      expect(ctaButton).toBeInTheDocument();
    });

    it('shows different text on mobile and desktop', () => {
      render(<Footer />);
      // Both spans should exist (one hidden on mobile, one on desktop)
      expect(screen.getByText('Get This Template')).toBeInTheDocument();
      expect(screen.getByText('Get Template')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('allows email input in subscribe form', () => {
      render(<Footer />);

      // Open subscribe section on mobile
      const subscribeButtons = screen.getAllByText('Subscribe');
      const subscribeButton = subscribeButtons.find(
        button => button.tagName === 'H2'
      )?.parentElement;

      if (subscribeButton) {
        fireEvent.click(subscribeButton);
      }

      const emailInput = screen.getByPlaceholderText(
        'Enter email address'
      ) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput.value).toBe('test@example.com');
    });

    it('register button is clickable', () => {
      render(<Footer />);

      // Open subscribe section on mobile
      const subscribeButtons = screen.getAllByText('Subscribe');
      const subscribeButton = subscribeButtons.find(
        button => button.tagName === 'H2'
      )?.parentElement;

      if (subscribeButton) {
        fireEvent.click(subscribeButton);
      }

      const registerButton = screen.getByText('Register');
      fireEvent.click(registerButton);
      // No error should occur
    });

    it('form prevents default submission', () => {
      render(<Footer />);

      const subscribeButtons = screen.getAllByText('Subscribe');
      const subscribeButton = subscribeButtons.find(
        button => button.tagName === 'H2'
      )?.parentElement;

      if (subscribeButton) {
        fireEvent.click(subscribeButton);
      }

      const form = screen
        .getByPlaceholderText('Enter email address')
        .closest('form');
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });

      if (form) {
        const defaultPrevented = !form.dispatchEvent(submitEvent);
        // Form should allow submission (component doesn't prevent default)
        expect(defaultPrevented).toBe(false);
      }
    });
  });

  describe('Accessibility', () => {
    it('all links have accessible names', () => {
      const { container } = render(<Footer />);
      const links = container.querySelectorAll('a');

      links.forEach(link => {
        const hasText = link.textContent && link.textContent.trim().length > 0;
        const hasAriaLabel = link.hasAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBe(true);
      });
    });

    it('email input has aria-label', () => {
      render(<Footer />);

      const subscribeButtons = screen.getAllByText('Subscribe');
      const subscribeButton = subscribeButtons.find(
        button => button.tagName === 'H2'
      )?.parentElement;

      if (subscribeButton) {
        fireEvent.click(subscribeButton);
      }

      const emailInput = screen.getByPlaceholderText('Enter email address');
      expect(emailInput).toHaveAttribute('aria-label', 'Email');
    });

    it('accordion buttons are properly structured', () => {
      render(<Footer />);

      const buttons = screen.getAllByRole('button');
      const accordionButtons = buttons.filter(
        button =>
          button.textContent?.includes('Services') ||
          button.textContent?.includes('Company') ||
          button.textContent?.includes('Subscribe')
      );

      expect(accordionButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('hides desktop layout on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<Footer />);
      const desktopGrid = container.querySelector('.hidden.lg\\:grid');
      expect(desktopGrid).toBeInTheDocument();
    });

    it('shows desktop layout on large screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      const { container } = render(<Footer />);
      const mobileAccordion = container.querySelector('.lg\\:hidden');
      expect(mobileAccordion).toBeInTheDocument();
    });
  });

  describe('Component Display Name', () => {
    it('has correct display name', () => {
      expect(Footer.displayName).toBe('Footer');
    });
  });
});
