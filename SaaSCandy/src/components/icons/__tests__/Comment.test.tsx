import { render } from '@testing-library/react';
import CommentIcon from '../Comment';

describe('AddressIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<CommentIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
