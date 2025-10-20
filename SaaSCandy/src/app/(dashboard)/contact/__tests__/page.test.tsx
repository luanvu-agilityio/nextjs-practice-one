import { render, screen } from '@testing-library/react';
import ContactPage from '@/app/(dashboard)/contact/page';
import DocsPage from '@/app/(dashboard)/docs/page';
import PortfolioPage from '@/app/(dashboard)/portfolio/page';
import PricingPage from '@/app/(dashboard)/pricing/page';
import ServicePage from '@/app/(dashboard)/services/page';

jest.mock('@/components/layout/PageLayout', () => {
  return function MockPageLayout({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) {
    return (
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/ContactPage', () => {
  return function MockContactPage() {
    return <div data-testid='contact-page'>Contact Form</div>;
  };
});

jest.mock('@/components/DocsContent', () => {
  return function MockDocsContent() {
    return <div data-testid='docs-content'>Docs Content</div>;
  };
});

jest.mock('@/components/PortfolioPage', () => {
  return function MockPortfolioPage() {
    return <div data-testid='portfolio-page'>Portfolio Content</div>;
  };
});

jest.mock('@/components/PricingPage', () => {
  return function MockPricingPage() {
    return <div data-testid='pricing-page'>Pricing Content</div>;
  };
});

jest.mock('@/components/ServicePage', () => {
  return function MockServicePage() {
    return <div data-testid='service-page'>Service Content</div>;
  };
});

describe('Contact Page', () => {
  it('should render page with correct title and subtitle', () => {
    render(<ContactPage />);

    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText(/Send us a message/)).toBeInTheDocument();
    expect(screen.getByTestId('contact-page')).toBeInTheDocument();
  });
});

describe('Docs Page', () => {
  it('should render page with correct title and subtitle', () => {
    render(<DocsPage />);

    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('Check our intensive docs')).toBeInTheDocument();
    expect(screen.getByTestId('docs-content')).toBeInTheDocument();
  });
});

describe('Portfolio Page', () => {
  it('should render page with correct title and subtitle', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText(/Select the ideal plan/)).toBeInTheDocument();
    expect(screen.getByTestId('portfolio-page')).toBeInTheDocument();
  });
});

describe('Pricing Page', () => {
  it('should render page with correct title and subtitle', () => {
    render(<PricingPage />);

    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(
      screen.getByText(/Choose the perfect plan that fits your needs/)
    ).toBeInTheDocument();
    expect(screen.getByTestId('pricing-page')).toBeInTheDocument();
  });
});

describe('Service Page', () => {
  it('should render page with correct title and subtitle', () => {
    render(<ServicePage />);

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(
      screen.getByText(/Choose the perfect plan that fits your needs/)
    ).toBeInTheDocument();
    expect(screen.getByTestId('service-page')).toBeInTheDocument();
  });
});
