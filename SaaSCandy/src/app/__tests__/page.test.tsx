import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock all child components
jest.mock('@/components/HeroSection', () => {
  return function HeroSection() {
    return <div data-testid='hero-section'>Hero Section</div>;
  };
});

jest.mock('@/components/ServicePage', () => {
  return function ServicePage() {
    return <div data-testid='service-page'>Service Page</div>;
  };
});

jest.mock('@/components/PortfolioPage', () => {
  return function PortfolioPage() {
    return <div data-testid='portfolio-page'>Portfolio Page</div>;
  };
});

jest.mock('@/components/PricingPage', () => {
  return function PricingPage() {
    return <div data-testid='pricing-page'>Pricing Page</div>;
  };
});

jest.mock('@/components/FAQSection', () => {
  return function FAQSection() {
    return <div data-testid='faq-section'>FAQ Section</div>;
  };
});

jest.mock('@/components/JoinUsSection', () => {
  return function JoinUsSection() {
    return <div data-testid='join-us-section'>Join Us Section</div>;
  };
});

describe('HomePage - Interactive Tests', () => {
  it('should render all main sections', () => {
    render(<HomePage />);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('service-page')).toBeInTheDocument();
    expect(screen.getByTestId('portfolio-page')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-page')).toBeInTheDocument();
    expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    expect(screen.getByTestId('join-us-section')).toBeInTheDocument();
  });

  it('should render sections in correct order', () => {
    const { container } = render(<HomePage />);
    const sections = container.querySelectorAll('[data-testid]');

    expect(sections[0]).toHaveAttribute('data-testid', 'hero-section');
    expect(sections[1]).toHaveAttribute('data-testid', 'service-page');
    expect(sections[2]).toHaveAttribute('data-testid', 'portfolio-page');
    expect(sections[3]).toHaveAttribute('data-testid', 'pricing-page');
    expect(sections[4]).toHaveAttribute('data-testid', 'faq-section');
    expect(sections[5]).toHaveAttribute('data-testid', 'join-us-section');
  });
});
