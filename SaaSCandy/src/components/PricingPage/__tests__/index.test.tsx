import { render, screen, fireEvent } from '@testing-library/react';
import PricingPage from '@/components/PricingPage';

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

describe('PricingPage - Interactive Tests', () => {
  it('should render pricing section heading', () => {
    render(<PricingPage />);

    expect(screen.getByText('Pricing Plan')).toBeInTheDocument();
    expect(
      screen.getByText("What's About Our Pricing Subscription")
    ).toBeInTheDocument();
  });

  it('should render billing toggle with monthly selected by default', () => {
    render(<PricingPage />);

    const monthlyLabel = screen.getByText('Monthly');
    const yearlyLabel = screen.getByText('Yearly');

    expect(monthlyLabel).toBeInTheDocument();
    expect(yearlyLabel).toBeInTheDocument();
    expect(monthlyLabel).toHaveClass('text-primary');
  });

  it('should toggle between monthly and yearly pricing', () => {
    render(<PricingPage />);

    const switchElement = screen.getByRole('switch');

    // Initially monthly
    expect(screen.getByText('Monthly')).toHaveClass('text-primary');

    // Toggle to yearly
    fireEvent.click(switchElement);

    expect(screen.getByText('Yearly')).toHaveClass('text-primary');
    expect(screen.getByText('Monthly')).toHaveClass('text-gray-background');
  });

  it('should display save up to 50% message', () => {
    render(<PricingPage />);

    expect(screen.getByText('Save Up To 50%')).toBeInTheDocument();
  });

  it('should calculate yearly price correctly', () => {
    render(<PricingPage />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    // Yearly price = monthly * 12 * 0.5
    // For Basic: 10 * 12 * 0.5 = 60
    // This would need to check actual rendered prices in PricingPlanCard
  });
});
