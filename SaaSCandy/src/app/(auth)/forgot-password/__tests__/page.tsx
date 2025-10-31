import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from '../page';
import { ForgotPasswordPageContent } from '@/components';


jest.mock('@/components', () => ({
  ForgotPasswordPageContent: jest.fn(() => (
    <div data-testid='forgot-password-content'>Forgot Password Content</div>
  )),
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByTestId('forgot-password-content')).toBeInTheDocument();
  });

  it('should render the ForgotPasswordPageContent component', () => {
    render(<ForgotPasswordPage />);
    expect(ForgotPasswordPageContent).toHaveBeenCalledTimes(1);
  });

  it('should have correct wrapper styling with py-16 class', () => {
    const { container } = render(<ForgotPasswordPage />);
    const wrapperDiv = container.firstChild as HTMLElement;
    expect(wrapperDiv).toHaveClass('py-16');
  });

  it('should wrap ForgotPasswordPageContent in a div', () => {
    const { container } = render(<ForgotPasswordPage />);
    const wrapperDiv = container.firstChild as HTMLElement;
    expect(wrapperDiv.tagName).toBe('DIV');
    expect(wrapperDiv).toContainElement(
      screen.getByTestId('forgot-password-content')
    );
  });

  it('should match snapshot', () => {
    const { container } = render(<ForgotPasswordPage />);
    expect(container).toMatchSnapshot();
  });
});
