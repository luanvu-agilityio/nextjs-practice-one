import { render, screen } from '@testing-library/react';
import ContactPage from '@/app/(dashboard)/contact/page';
import DocsPage, * as DocsModule from '@/app/(dashboard)/docs/page';
import PortfolioPage from '@/app/(dashboard)/portfolio/page';
import PricingPage from '@/app/(dashboard)/pricing/page';
import ServicePage from '@/app/(dashboard)/services/page';

jest.mock('@/components/layout/PageLayout', () => ({
  PageLayout: ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) => {
    return (
      <div data-testid='page-layout'>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    );
  },
}));

jest.mock('@/components/pages', () => ({
  ContactPageContent: () => <div data-testid='contact-page'>Contact Form</div>,
  DocsContent: () => <div data-testid='docs-content'>Docs Content</div>,
  PortfolioPageContent: () => (
    <div data-testid='portfolio-page'>Portfolio Content</div>
  ),
  PricingPageContent: () => (
    <div data-testid='pricing-page'>Pricing Content</div>
  ),
  ServicePageContent: () => (
    <div data-testid='service-page'>Service Content</div>
  ),
}));

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
    expect(DocsModule.metadata).toBeDefined();
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
