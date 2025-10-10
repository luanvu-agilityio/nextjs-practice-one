import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../index';
import { Mail } from 'lucide-react';

describe('Input - Snapshots', () => {
  it('should match snapshot with default props', () => {
    const { container } = render(
      <Input label='Email' placeholder='Enter email' />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with error state', () => {
    const { container } = render(
      <Input
        id='test-input-error'
        label='Email'
        placeholder='Enter email'
        errorMessage='Invalid email'
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with password toggle', () => {
    const { container } = render(
      <Input
        label='Password'
        type='password'
        showPasswordToggle
        placeholder='Enter password'
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with left element', () => {
    const { container } = render(
      <Input
        label='Search'
        placeholder='Search...'
        leftElement={<Mail className='h-4 w-4' />}
      />
    );
    expect(container).toMatchSnapshot();
  });
});

describe('Input - Interactive', () => {
  it('should handle text input changes', () => {
    const handleChange = jest.fn();
    render(
      <Input label='Email' placeholder='Enter email' onChange={handleChange} />
    );

    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test@example.com');
  });

  it('should toggle password visibility', () => {
    render(
      <Input
        label='Password'
        type='password'
        showPasswordToggle
        placeholder='Enter password'
      />
    );

    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByLabelText('Show password');

    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Hide password'));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should display error message when provided', () => {
    const errorMessage = 'This field is required';
    render(
      <Input
        label='Email'
        placeholder='Enter email'
        errorMessage={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input label='Email' placeholder='Enter email' disabled />);

    const input = screen.getByLabelText('Email');
    expect(input).toBeDisabled();
  });

  it('should hide label visually when hideLabel is true', () => {
    render(<Input label='Email' placeholder='Enter email' hideLabel />);

    const label = screen.getByText('Email');
    expect(label).toHaveClass('sr-only');

    const input = screen.getByPlaceholderText('Enter email');
    expect(input).toHaveAttribute('aria-label', 'Email');
  });

  it('should use custom id when provided', () => {
    const customId = 'custom-input-id';
    render(<Input id={customId} label='Email' placeholder='Enter email' />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('id', customId);
  });
});
