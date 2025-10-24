import { render } from '@testing-library/react';
import { TwitterIcon } from '../TwitterIcon';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<TwitterIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
