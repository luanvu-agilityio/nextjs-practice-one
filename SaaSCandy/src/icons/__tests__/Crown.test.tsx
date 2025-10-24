import { render } from '@testing-library/react';
import { CrownIcon } from '../Crown';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<CrownIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
