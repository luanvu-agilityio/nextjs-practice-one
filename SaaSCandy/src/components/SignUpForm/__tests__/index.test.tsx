import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SignUpForm from '../index';

const mockPush = jest.fn();
const mockPathname = '/signup';
const mockSignIn = jest.fn();
const mockSignUpAction = jest.fn();
const mockHandleSocialAuth = jest.fn();
const mockShowToast = jest.fn();

// Mock useActionState
const mockUseActionState = jest.fn();

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: (...args: unknown[]) => mockUseActionState(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

jest.mock('next/link', () => {
  const MockedLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  MockedLink.displayName = 'MockedLink';
  return MockedLink;
});

jest.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

jest.mock('@/lib/auth', () => ({
  signUpAction: (...args: unknown[]) => mockSignUpAction(...args),
}));

jest.mock('@/utils/auth', () => ({
  extractBreadcrumbs: jest.fn(() => [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Sign Up', href: '/signup', isActive: true },
  ]),
  handleSocialAuth: (...args: unknown[]) => mockHandleSocialAuth(...args),
}));

jest.mock('@/utils', () => {
  const actualZod = jest.requireActual('zod');
  return {
    extractBreadcrumbs: jest.fn(() => [
      { label: 'Home', href: '/', isActive: false },
      { label: 'Sign Up', href: '/signup', isActive: true },
    ]),
    handleSocialAuth: (...args: unknown[]) => mockHandleSocialAuth(...args),
    signInSchema: actualZod.z.object({
      email: actualZod.z.string().email(),
      password: actualZod.z.string().min(1),
    }),
  };
});

// Mock Toast component
jest.mock('@/components/common/Toast', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
}));

jest.mock('@/constants', () => ({
  AUTH_MESSAGES: {
    SIGN_UP: {
      title: 'Sign Up',
      submitButton: 'Sign Up',
      submittingButton: 'Signing Up...',
      privacyText: 'By creating an account you agree with our',
      privacyLink: 'Privacy Policy',
      alreadyMember: 'Already have an account?',
      signInLink: 'Sign In',
    },
    SOCIAL: {
      googleSignUp: 'Sign up with Google',
      githubSignUp: 'Sign up with GitHub',
    },
    DIVIDER: 'or',
  },
  ROUTES: {
    HOME: '/',
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
    PRIVACY: '/privacy',
  },
  SOCIAL_PROVIDERS: {
    GOOGLE: 'google',
    GITHUB: 'github',
  },
  TOAST_MESSAGES: {
    SIGN_UP: {
      SUCCESS: {
        title: 'Account Created Successfully!',
        description: 'Welcome to SaaSCandy! Signing you in automatically...',
      },
      ERROR: {
        title: 'Registration Failed',
        description: 'Registration failed. Please try again.',
      },
      AUTO_SIGNIN_FAILED: {
        title: 'Registration Successful',
        description:
          'Account created but auto sign-in failed. Please sign in manually.',
      },
    },
    SOCIAL: {
      SIGNUP_REDIRECT: {
        title: 'Redirecting...',
        description: 'Creating account with {provider}. Please wait...',
      },
      SIGNUP_ERROR: {
        title: 'Social Sign Up Failed',
        description:
          'Failed to create account with {provider}. Please try again.',
      },
    },
  },
}));

// Mock React Hook Form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    control: {},
    handleSubmit: jest.fn(fn => (e: Event) => {
      e.preventDefault();
      fn({ email: 'test@example.com', password: 'password123' });
    }),
    formState: {
      isSubmitting: false,
      errors: {},
    },
    clearErrors: jest.fn(),
  })),
  Controller: ({
    render,
  }: {
    render: (props: unknown) => React.ReactElement;
  }) =>
    render({
      field: { onChange: jest.fn(), value: '', name: 'test' },
      fieldState: { error: null },
    }),
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(),
}));

jest.mock('@/components/common', () => ({
  InputController: ({
    name,
    placeholder,
    type,
  }: {
    name: string;
    placeholder?: string;
    type?: string;
  }) => (
    <input
      data-testid={name}
      name={name}
      placeholder={placeholder}
      type={type}
    />
  ),
  Button: ({
    children,
    disabled,
    type,
    ...props
  }: {
    children: React.ReactNode;
    type?: 'button' | 'reset' | 'submit';
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button type={type} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Heading: ({ content }: { content: string }) => <h2>{content}</h2>,
  Divider: ({ text }: { text: string }) => <div>{text}</div>,
}));

jest.mock('@/components/common/Breadcrumb', () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => (
    <nav>{children}</nav>
  ),
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => (
    <ol>{children}</ol>
  ),
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  BreadcrumbLink: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
  BreadcrumbSeparator: () => <span>/</span>,
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock('@/components/SocialButton', () => {
  return function SocialButton({
    children,
    provider,
    onClick,
  }: {
    children: React.ReactNode;
    provider: string;
    onClick: () => void;
  }) {
    return (
      <button onClick={onClick} data-provider={provider}>
        {children}
      </button>
    );
  };
});

jest.mock('@/components/icons/GitHubIcon', () => {
  return function GitHubIcon() {
    return <svg data-testid='github-icon' />;
  };
});

jest.mock('@/components/icons/GoogleIcon', () => {
  return function GoogleIcon() {
    return <svg data-testid='google-icon' />;
  };
});

describe.skip('SignUpForm - Snapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActionState.mockReturnValue([{ error: null }, jest.fn(), false]);
  });

  it('matches snapshot', () => {
    const { container } = render(<SignUpForm />);
    expect(container).toMatchSnapshot();
  });
});

describe.skip('SignUpForm - Interactive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActionState.mockReturnValue([{ error: null }, jest.fn(), false]);
  });

  it('handles social sign up button clicks', async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    const googleButton = screen.getByRole('button', {
      name: /sign up with google/i,
    });
    await user.click(googleButton);

    await waitFor(() => {
      expect(mockHandleSocialAuth).toHaveBeenCalledWith('google', 'signup');
    });
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    const mockAction = jest.fn();

    mockUseActionState.mockReturnValue([{ error: null }, mockAction, false]);

    render(<SignUpForm />);

    const nameInput = screen.getByTestId('name');
    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const submitButton = screen.getByRole('button', { name: /^sign up$/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });
  });
});
