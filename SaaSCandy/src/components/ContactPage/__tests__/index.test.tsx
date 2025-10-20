import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactPage from '../index';

describe('ContactPage Component', () => {
  it('matches snapshot', () => {
    const { container } = render(<ContactPage />);
    expect(container).toMatchSnapshot();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText, getByText } = render(<ContactPage />);

    await user.type(getByPlaceholderText('Enter your name'), 'John Doe');
    await user.type(
      getByPlaceholderText('Enter your email'),
      'john@example.com'
    );
    await user.type(getByPlaceholderText('Enter project name'), 'Test Project');
    await user.type(
      getByPlaceholderText('Briefly describe your requirements'),
      'Test message'
    );

    const submitButton = getByText('Submit');
    await user.click(submitButton);
  });
});
