import { render } from '@testing-library/react';
import { CommentIcon } from '../Comment';

describe('CommentIcon', () => {
  it('matches snapshot', () => {
    const { container } = render(<CommentIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
