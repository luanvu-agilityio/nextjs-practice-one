import { render } from '@testing-library/react';
import FacebookIcon from '../FacebookIcon';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<FacebookIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
