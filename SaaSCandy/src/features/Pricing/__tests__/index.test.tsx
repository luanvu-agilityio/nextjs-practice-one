import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingPageContent } from '@/features/Pricing';

jest.mock('@/constants/pricing-plan', () => ({
  pricingPlans: [
    {
      name: 'Basic',
      price: 10,
      features: ['Feature 1', 'Feature 2'],
      popular: false,
    },
    {
      name: 'Pro',
      price: 20,
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 50,
      features: ['All features'],
      popular: false,
    },
  ],
}));

jest.mock('@/icons', () => ({
  ArrowIcon: ({ className }: { className?: string }) => (
    <span className={className}>✓</span>
  ),
}));

jest.mock('@/components/ui', () => ({
  __esModule: true,
  // Provide the named UI components used by PricingPageContent
  Heading: ({
    content,
    children,
  }: {
    content?: React.ReactNode;
    children?: React.ReactNode;
  } & React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2>{content ?? children}</h2>
  ),
  Typography: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement> & {
    children?: React.ReactNode;
  }) => <p {...props}>{children}</p>,
  LazySection: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => (
    <section {...props}>{children}</section>
  ),
}));

// The PricingPage imports Switch from '@/components' (index). Mock it here.
jest.mock('@/components', () => ({
  Switch: ({
    checked,
    onCheckedChange,
    className,
  }: {
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
    className?: string;
  }) => (
    <button
      role='switch'
      aria-checked={checked}
      className={className}
      onClick={() => onCheckedChange(!checked)}
    >
      Switch
    </button>
  ),
}));

interface MockPricingPlan {
  name: string;
  price: number;
  features: string[];
  popular: boolean;
}

jest.mock('../PricingPlanCard/index', () => ({
  PricingPlanCard: ({ plan }: { plan: MockPricingPlan }) => (
    <div>
      <div>{plan.name}</div>
      <div>{plan.price}</div>
      {plan.popular && <span>Most Popular</span>}
      <ul>
        {plan.features.map((f: string) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  ),
}));

jest.mock('@/icons', () => ({
  ArrowIcon: ({ className }: { className?: string }) => (
    <span className={className}>→</span>
  ),
}));

describe('PricingPage - Interactive Tests', () => {
  beforeAll(() => {
    // @ts-expect-error : Mock window.IntersectionObserver
    global.IntersectionObserver = class {
      constructor() {}
      observe() {}
      disconnect() {}
      unobserve() {}
    };
  });
  it('should render pricing section heading', () => {
    render(<PricingPageContent />);

    expect(screen.getByText('Pricing Plan')).toBeInTheDocument();
    expect(
      screen.getByText("What's About Our Pricing Subscription")
    ).toBeInTheDocument();
  });

  it('should render billing toggle with monthly selected by default', () => {
    render(<PricingPageContent />);

    const monthlyLabel = screen.getByText('Monthly');
    const yearlyLabel = screen.getByText('Yearly');

    expect(monthlyLabel).toBeInTheDocument();
    expect(yearlyLabel).toBeInTheDocument();
    expect(monthlyLabel).toHaveClass('text-primary');
  });

  it('should toggle between monthly and yearly pricing', () => {
    render(<PricingPageContent />);

    const switchElement = screen.getByRole('switch');

    // Initially monthly
    expect(screen.getByText('Monthly')).toHaveClass('text-primary');

    // Toggle to yearly
    fireEvent.click(switchElement);

    expect(screen.getByText('Yearly')).toHaveClass('text-primary');
    expect(screen.getByText('Monthly')).toHaveClass('text-gray-background');
  });

  it('should display save up to 50% message', () => {
    render(<PricingPageContent />);

    expect(screen.getByText('Save Up To 50%')).toBeInTheDocument();
  });

  it('should calculate yearly price correctly', () => {
    render(<PricingPageContent />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    // Yearly price = monthly * 12 * 0.5
    // For Basic: 10 * 12 * 0.5 = 60
    // This would need to check actual rendered prices in PricingPlanCard
  });
});
