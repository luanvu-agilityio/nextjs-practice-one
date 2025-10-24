import { render, screen } from '@testing-library/react';
import SignInPage from '@/app/(auth)/signin/page';

jest.mock('@/components/pages', () => ({
  SignInPageContent: () => <div data-testid='signin-form'>Sign In Form</div>,
}));

describe('SignInPage - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<SignInPage />);
    expect(container).toMatchSnapshot();
  });

  it('should render with correct wrapper classes', () => {
    const { container } = render(<SignInPage />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass('py-16');
  });

  it('should render SignInPageContent component', () => {
    render(<SignInPage />);
    expect(screen.getByTestId('signin-form')).toBeInTheDocument();
  });
});
