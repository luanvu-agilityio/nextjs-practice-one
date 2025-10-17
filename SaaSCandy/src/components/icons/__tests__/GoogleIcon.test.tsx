import { render } from '@testing-library/react';
import GoogleIcon from '../GoogleIcon';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<GoogleIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
