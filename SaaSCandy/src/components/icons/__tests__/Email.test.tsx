import { render } from '@testing-library/react';
import EmailIcon from '../Email';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<EmailIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
