import { render } from '@testing-library/react';
import HealthIcon from '../Health';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<HealthIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
