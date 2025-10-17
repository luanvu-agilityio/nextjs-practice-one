import { render } from '@testing-library/react';
import AddressIcon from '../Address';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<AddressIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
