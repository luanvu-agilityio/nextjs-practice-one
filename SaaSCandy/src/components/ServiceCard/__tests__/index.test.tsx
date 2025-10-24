import { render, screen } from '@testing-library/react';
import { ServiceCard } from '../index';

jest.mock('../../common', () => ({
  Heading: ({ content, className }: { content: string; className: string }) => (
    <h4 className={className}>{content}</h4>
  ),
  Typography: ({
    content,
    className,
  }: {
    content: string;
    className: string;
  }) => <p className={className}>{content}</p>,
}));

describe('ServiceCard', () => {
  const mockDoc = {
    icon: <svg data-testid='test-icon'>Icon</svg>,
    title: 'Test Service',
    description: 'This is a test service description',
  };

  it('should render service details correctly', () => {
    render(<ServiceCard index={0} doc={mockDoc} />);

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test service description')
    ).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should apply proper spacing classes', () => {
    const { container } = render(<ServiceCard index={0} doc={mockDoc} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('space-y-4');
    expect(card.className).toContain('sm:space-y-6');
  });
});
