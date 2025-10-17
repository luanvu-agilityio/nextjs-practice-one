import { render } from '@testing-library/react';
import LinkedInIcon from '../LinkedInIcon';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<LinkedInIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
