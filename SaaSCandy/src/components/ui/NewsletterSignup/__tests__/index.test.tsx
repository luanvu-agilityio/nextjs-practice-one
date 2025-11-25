import { render, screen, fireEvent } from '@testing-library/react';
import { NewsletterSignup } from '..';

describe('NewsletterSignup - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<NewsletterSignup />);
    expect(container).toMatchSnapshot();
  });

  it('should render heading and form', () => {
    render(<NewsletterSignup />);

    expect(screen.getByText('Join our Newsletter')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Email address Subscribe')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /subscribe/i })
    ).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<NewsletterSignup className='custom-class' />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});
describe('NewsletterSignup - Form Interaction Tests', () => {
  it('should update email input value', () => {
    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(
      'Email address Subscribe'
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('should clear email after form submission', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(
      'Email address Subscribe'
    ) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /subscribe/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    expect(emailInput.value).toBe('');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Newsletter signup:',
      'test@example.com'
    );

    consoleSpy.mockRestore();
  });

  it('should require email input', () => {
    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText('Email address Subscribe');

    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('type', 'email');
  });
});
