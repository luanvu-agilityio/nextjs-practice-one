import { render } from '@testing-library/react';
import GitHubIcon from '../GitHub';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<GitHubIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
