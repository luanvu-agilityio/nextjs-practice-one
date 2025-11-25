import { render } from '@testing-library/react';
import { Spinner } from '../index';

describe('Spinner', () => {
  it('matches snapshot', () => {
    const { container } = render(<Spinner />);
    expect(container).toMatchSnapshot();
  });

  it('has loading role and aria-label', () => {
    const { getByRole } = render(<Spinner />);
    const spinner = getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('applies custom className', () => {
    const { getByRole } = render(<Spinner className='custom-spinner' />);
    expect(getByRole('status')).toHaveClass('custom-spinner');
  });
});
