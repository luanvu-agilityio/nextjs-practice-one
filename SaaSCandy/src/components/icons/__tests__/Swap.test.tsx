import { render } from '@testing-library/react';
import SwapIcon from '../Swap';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<SwapIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
