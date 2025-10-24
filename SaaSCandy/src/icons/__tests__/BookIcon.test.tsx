import { render } from '@testing-library/react';
import { BookIcon } from '../BookIcon';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<BookIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
