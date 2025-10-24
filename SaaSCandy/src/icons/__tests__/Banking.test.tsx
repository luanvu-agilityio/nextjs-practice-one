import { render } from '@testing-library/react';
import { BankingIcon } from '../Banking';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<BankingIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
