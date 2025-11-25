import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// Component
import { Typography } from '..';

describe('Typography', () => {
  it('renders match snapshot', () => {
    const { container } = render(<Typography content='Typography' />);

    expect(container).toMatchSnapshot();
  });

  it('renders with default props', () => {
    render(<Typography content='Typography' />);
    const element = screen.getByText('Typography');

    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('P');
    expect(element).toHaveClass('text-md');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Typography size='xs' content='Small text' />);

    expect(screen.getByText('Small text')).toHaveClass('text-xs');

    rerender(<Typography size='sm' content='Small text' />);
    expect(screen.getByText('Small text')).toHaveClass('text-sm');

    rerender(<Typography size='lg' content='Large text' />);
    expect(screen.getByText('Large text')).toHaveClass('text-lg');
  });

  it('applies custom className', () => {
    render(<Typography className='custom-class' content='Custom text' />);
    const element = screen.getByText('Custom text');

    expect(element).toHaveClass('custom-class');
  });
});
