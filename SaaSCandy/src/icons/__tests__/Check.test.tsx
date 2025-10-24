import { render } from '@testing-library/react';
import { CheckIcon } from '../Check';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<CheckIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
