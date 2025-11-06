import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JoinUsSection } from '@/components/JoinUsSection';

describe('JoinUsSection - Interactive Tests', () => {
  beforeAll(() => {
    // @ts-expect-error : Mock window.IntersectionObserver
    global.IntersectionObserver = class {
      constructor() {}
      observe() {}
      disconnect() {}
      unobserve() {}
    };
  });
  it('should render form with all input fields', () => {
    render(<JoinUsSection />);

    expect(screen.getAllByPlaceholderText('Place holder')).toHaveLength(2);
    expect(
      screen.getByPlaceholderText('Enter your email address')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your password')
    ).toBeInTheDocument();
  });

  it('should render trust logos section', () => {
    render(<JoinUsSection />);

    expect(
      screen.getByText('Trusted by content creators across the world')
    ).toBeInTheDocument();
    expect(screen.getByAltText('Google Logo')).toBeInTheDocument();
    expect(screen.getByAltText('Microsoft Logo')).toBeInTheDocument();
    expect(screen.getByAltText('Amazon Logo')).toBeInTheDocument();
  });

  it('should display testimonial section', () => {
    render(<JoinUsSection />);

    expect(screen.getByText('Merky Lester')).toBeInTheDocument();
    expect(screen.getByText('Managers')).toBeInTheDocument();
    expect(screen.getByAltText('Merky Lester')).toBeInTheDocument();
  });

  it('should have submit button', () => {
    render(<JoinUsSection />);

    const submitButton = screen.getByRole('button', { name: /try for free/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('submits valid form and calls onSubmit (console.log)', async () => {
    const user = userEvent.setup();
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    render(<JoinUsSection />);

    const [firstNameInput, lastNameInput] =
      screen.getAllByPlaceholderText('Place holder');
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const agreeCheckbox = screen.getByLabelText(
      'Agree to terms and conditions'
    );
    const submitButton = screen.getByRole('button', { name: /try for free/i });

    // Fill valid values according to joinUsSchema
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'John');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Doe');
    await user.clear(emailInput);
    await user.type(emailInput, 'john.doe@example.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'password123');
    await user.click(agreeCheckbox);

    await user.click(submitButton);

    // onSubmit logs: console.log('Form submitted:', data)
    expect(consoleLogSpy).toHaveBeenCalled();
    const [[firstArg, secondArg]] = consoleLogSpy.mock.calls;
    expect(firstArg).toBe('Form submitted:');
    expect(secondArg).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      agreeTerms: true,
    });

    consoleLogSpy.mockRestore();
  });
});
