import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInPageContent from '../index';

const mockPush = jest.fn();
const mockPathname = '/signin';
const mockSignIn = jest.fn();
const mockSignInAction = jest.fn();
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

jest.mock('better-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

jest.mock('@/lib/auth', () => ({
  signInAction: (...args: unknown[]) => mockSignInAction(...args),
}));

jest.mock('@/utils/auth', () => ({
  extractBreadcrumbs: jest.fn(() => [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Sign In', href: '/signin', isActive: true },
  ]),
  handleSocialAuth: (...args: unknown[]) => mockHandleSocialAuth(...args),
}));

// Mock Toast component
jest.mock('@/components/common/Toast', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
}));

jest.mock('@/constants', () => ({
  AUTH_MESSAGES: {
    SIGN_IN: {
      title: 'Sign In',
      submitButton: 'Sign In',
      submittingButton: 'Signing In...',
      forgotPassword: 'Forgot Password?',
      notMember: 'Not a member?',
      signUpLink: 'Sign up',
    },
    SOCIAL: {
      googleSignIn: 'Sign in with Google',
      githubSignIn: 'Sign in with GitHub',
    },
    DIVIDER: 'or',
  },
  ROUTES: {
    HOME: '/',
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
  },
  SOCIAL_PROVIDERS: {
    GOOGLE: 'google',
    GITHUB: 'github',
  },
  TOAST_MESSAGES: {
    SIGN_IN: {
      SUCCESS: {
        title: 'Sign In Successful!',
        description: 'Welcome back! Redirecting to your dashboard...',
      },
      ERROR: {
        title: 'Sign In Failed',
        description: 'Invalid email or password. Please try again.',
      },
      AUTH_ERROR: {
        title: 'Authentication Error',
        description:
          'Sign in successful but session creation failed. Please try again.',
      },
    },
    SOCIAL: {
      SIGNIN_REDIRECT: {
        title: 'Redirecting...',
        description: 'Signing in with {provider}. Please wait...',
      },
      SIGNIN_ERROR: {
        title: 'Social Sign In Failed',
        description: 'Failed to sign in with {provider}. Please try again.',
      },
    },
    FEATURES: {
      FORGOT_PASSWORD: {
        title: 'Feature Coming Soon',
        description: 'Password reset functionality will be available soon.',
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

jest.mock('@/components/icons/Logo', () => {
  return function LogoIcon({ className }: { className?: string }) {
    return <svg data-testid='logo-icon' className={className} />;
  };
});

jest.mock('@/utils', () => ({
  signInSchema: jest.requireActual('zod').z.object({
    email: jest.requireActual('zod').z.string().email(),
    password: jest.requireActual('zod').z.string().min(1),
  }),
}));

describe('SignInForm - Snapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseActionState.mockReturnValue([{ error: null }, jest.fn(), false]);
  });

  it('matches snapshot', () => {
    const { container } = render(<SignInPageContent />);
    expect(container).toMatchSnapshot();
  });
});

describe('SignInForm - Interactive', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseActionState.mockReturnValue([{ error: null }, jest.fn(), false]);
  });

  it('handles social sign in button clicks', async () => {
    const user = userEvent.setup();

    render(<SignInPageContent />);

    const googleButton = screen.getByRole('button', {
      name: /sign in with google/i,
    });
    await user.click(googleButton);

    await waitFor(() => {
      expect(mockHandleSocialAuth).toHaveBeenCalledWith('google', 'signin');
    });
  });
});
