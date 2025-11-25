import { render, screen, fireEvent } from '@testing-library/react';
import { SignInFooter } from '../SignInFooter';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock('@/constants', () => ({
  AUTH_MESSAGES: {
    SIGN_IN: {
      forgotPassword: 'Forgot Password?',
      notMember: 'Not a member?',
      signUpLink: 'Sign up',
    },
  },
  ROUTES: {
    SIGN_UP: '/signup',
  },
}));

describe('SignInFooter', () => {
  it('renders forgot password button when not requires2FA', () => {
    const handleForgotPassword = jest.fn();
    render(
      <SignInFooter
        loading={false}
        requires2FA={false}
        handleForgotPassword={handleForgotPassword}
      />
    );
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Forgot Password?'));
    expect(handleForgotPassword).toHaveBeenCalled();
  });

  it('does not render forgot password button when requires2FA', () => {
    render(
      <SignInFooter
        loading={false}
        requires2FA={true}
        handleForgotPassword={jest.fn()}
      />
    );
    expect(screen.queryByText('Forgot Password?')).not.toBeInTheDocument();
  });

  it('renders sign up link', () => {
    render(
      <SignInFooter
        loading={false}
        requires2FA={false}
        handleForgotPassword={jest.fn()}
      />
    );
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.getByText('Sign up').closest('a')).toHaveAttribute(
      'href',
      '/signup'
    );
  });
});
