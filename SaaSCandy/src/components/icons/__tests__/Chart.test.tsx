import { render } from '@testing-library/react';
import ChartIcon from '../Chart';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<ChartIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
