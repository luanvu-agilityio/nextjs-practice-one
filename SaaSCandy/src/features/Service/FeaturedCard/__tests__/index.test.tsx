import { render, screen } from '@testing-library/react';
import { FeatureCard } from '..';

const mockIcon = <div data-testid='mock-icon'>Icon</div>;

describe('FeatureCard - Snapshot Tests', () => {
  it('should match snapshot with href', () => {
    const { container } = render(
      <FeatureCard
        title='Test Feature'
        description='Test description'
        icon={mockIcon}
        href='/test'
        actionText='Learn More'
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render as link when href provided', () => {
    render(
      <FeatureCard
        title='Test Feature'
        description='Test description'
        href='/test'
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should render without link when no href', () => {
    render(<FeatureCard title='Test Feature' description='Test description' />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(
      <FeatureCard
        title='Test Feature'
        description='Test description'
        icon={mockIcon}
      />
    );

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should render custom action text', () => {
    render(
      <FeatureCard
        title='Test Feature'
        description='Test description'
        href='/test'
        actionText='Custom Action'
      />
    );

    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });
});
