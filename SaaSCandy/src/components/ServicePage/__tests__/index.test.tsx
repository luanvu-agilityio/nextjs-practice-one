import { render, screen } from '@testing-library/react';
import ServicePage from '../index';

jest.mock('@/constants/app-categories', () => ({
  appCategories: [
    {
      title: 'E-commerce',
      description: 'Build online stores',
      icon: <span>Icon1</span>,
      href: '/services/ecommerce',
    },
    {
      title: 'Healthcare',
      description: 'Medical applications',
      icon: <span>Icon2</span>,
      href: '/services/healthcare',
    },
  ],
}));

jest.mock('../../FeaturedCard', () => ({
  FeatureCard: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div data-testid='feature-card'>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

describe('ServicePage', () => {
  it('should render page heading', () => {
    render(<ServicePage />);

    expect(
      screen.getByText('Innovative Apps for Your Business Needs')
    ).toBeInTheDocument();
  });

  it('should render all app categories', () => {
    render(<ServicePage />);

    expect(screen.getByText('E-commerce')).toBeInTheDocument();
    expect(screen.getByText('Build online stores')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
    expect(screen.getByText('Medical applications')).toBeInTheDocument();
  });

  it('should render correct number of feature cards', () => {
    render(<ServicePage />);

    const cards = screen.getAllByTestId('feature-card');
    expect(cards).toHaveLength(2);
  });

  it('should apply background image styling', () => {
    const { container } = render(<ServicePage />);

    const section = container.querySelector('section');
    expect(section?.style.backgroundImage).toContain('service-background.png');
  });
});
