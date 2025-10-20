import { render, screen } from '@testing-library/react';
import JoinUsSection from '@/components/JoinUsSection';

describe('JoinUsSection - Interactive Tests', () => {
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
});
