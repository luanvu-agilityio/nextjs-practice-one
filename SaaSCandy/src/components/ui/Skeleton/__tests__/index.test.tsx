import { render } from '@testing-library/react';
import { Skeleton } from '../index';

describe('Skeleton', () => {
  it('matches snapshot', () => {
    const { container } = render(<Skeleton />);
    expect(container).toMatchSnapshot();
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className='custom-class' />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has animate-pulse class', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});
