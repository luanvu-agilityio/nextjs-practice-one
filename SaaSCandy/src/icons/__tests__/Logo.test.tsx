import { render } from '@testing-library/react';
import { LogoIcon } from '../Logo';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<LogoIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
