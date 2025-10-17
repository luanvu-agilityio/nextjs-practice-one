import { render } from '@testing-library/react';
import ArrowIcon from '../Arrow';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<ArrowIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
