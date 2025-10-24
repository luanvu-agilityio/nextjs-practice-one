import { render } from '@testing-library/react';
import { ShoppingBagIcon } from '../ShoppingBag';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<ShoppingBagIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
