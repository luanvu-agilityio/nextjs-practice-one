import { render, screen } from '@testing-library/react';

import { PricingPlanCard } from '../index';
import { PricingPlan } from '@/types';

jest.mock('@/components/common', () => ({
  Button: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant: string;
    className: string;
  }) => (
    <button data-variant={variant} className={className}>
      {children}
    </button>
  ),
  Typography: ({
    content,
    className,
  }: {
    content?: string;
    className?: string;
    children?: React.ReactNode;
  }) => <div className={className}>{content}</div>,
}));

jest.mock('@/icons', () => ({
  CheckIcon: ({ className }: { className?: string }) => (
    <span className={className}>✓</span>
  ),
}));

describe('PricingPlanCard', () => {
  const mockPlan: PricingPlan = {
    name: 'Pro Plan',
    price: 99,
    description: 'Perfect for growing businesses',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    popular: false,
  };

  it('should render all features', () => {
    render(<PricingPlanCard plan={mockPlan} />);

    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Feature 3')).toBeInTheDocument();
  });

  it('should show "Most Popular" badge for popular plans', () => {
    const popularPlan = { ...mockPlan, popular: true };
    render(<PricingPlanCard plan={popularPlan} />);

    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('should not show "Most Popular" badge for non-popular plans', () => {
    render(<PricingPlanCard plan={mockPlan} />);

    expect(screen.queryByText('Most Popular')).not.toBeInTheDocument();
  });

  it('should render primary button variant for popular plans', () => {
    const popularPlan = { ...mockPlan, popular: true };
    render(<PricingPlanCard plan={popularPlan} />);

    const button = screen.getByRole('button', { name: 'Get Started' });
    expect(button).toHaveAttribute('data-variant', 'primary');
  });

  it('should render secondary button variant for non-popular plans', () => {
    render(<PricingPlanCard plan={mockPlan} />);

    const button = screen.getByRole('button', { name: 'Get Started' });
    expect(button).toHaveAttribute('data-variant', 'secondary');
  });

  it('should apply border styling for popular plans', () => {
    const popularPlan = { ...mockPlan, popular: true };
    const { container } = render(<PricingPlanCard plan={popularPlan} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-2');
    expect(card.className).toContain('border-orange-background');
  });
});
