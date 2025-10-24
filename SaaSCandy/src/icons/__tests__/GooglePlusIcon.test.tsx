import { render } from '@testing-library/react';
import { GooglePlusIcon } from '../GooglePlusIcon';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<GooglePlusIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
