import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../index';

describe('Switch Component', () => {
  it('matches snapshot', () => {
    const { container } = render(<Switch />);
    expect(container).toMatchSnapshot();
  });

  it('toggles state when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const { getByRole } = render(<Switch onCheckedChange={handleChange} />);

    const switchElement = getByRole('switch');
    await user.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
