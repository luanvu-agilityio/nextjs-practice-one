import { render } from '@testing-library/react';
import { GitHub } from '../GitHub';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<GitHub />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
