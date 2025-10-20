import { render, screen } from '@testing-library/react';
import SignUpPage from '@/app/(auth)/signup/page';

jest.mock('@/components/SignUpForm', () => ({
  SignUpPageContent: function SignUpPageContent() {
    return <div data-testid='signup-form'>Sign Up Form</div>;
  },
}));

describe('SignUpPage - Interactive Tests', () => {
  it('should render SignUpPageContent component', () => {
    render(<SignUpPage />);
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });

  it('should have py-16 padding on wrapper', () => {
    const { container } = render(<SignUpPage />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass('py-16');
    expect(wrapper.tagName).toBe('DIV');
  });

  it('should render only one child element', () => {
    const { container } = render(<SignUpPage />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper.children).toHaveLength(1);
  });
});
