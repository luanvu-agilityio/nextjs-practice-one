import { render } from '@testing-library/react';
import { GitHubIcon } from '../GitHubIcon';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<GitHubIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
