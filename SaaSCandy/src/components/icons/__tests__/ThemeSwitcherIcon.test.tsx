import { render } from '@testing-library/react';
import ThemeSwitcherIcon from '../ThemeSwitcherIcon';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<ThemeSwitcherIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
