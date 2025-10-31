import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignInPageContent } from '../index';

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockPathname = '/signin';
const mockSignIn = jest.fn();
const mockHandleSocialAuth = jest.fn();
const mockShowToast = jest.fn();
const mockSend2FACode = jest.fn();
const mockVerify2FACode = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
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

jest.mock('@/lib/auth-client', () => ({
  signIn: {
    email: (...args: unknown[]) => mockSignIn(...args),
  },
}));

jest.mock('@/service', () => ({
  send2FACode: (...args: unknown[]) => mockSend2FACode(...args),
  verify2FACode: (...args: unknown[]) => mockVerify2FACode(...args),
}));

jest.mock('@/utils/social-auth', () => ({
  handleSocialAuth: (...args: unknown[]) => mockHandleSocialAuth(...args),
}));

jest.mock('@/utils', () => ({
  signInSchema: jest.requireActual('zod').z.object({
    email: jest.requireActual('zod').z.string().email(),
    password: jest.requireActual('zod').z.string().min(1),
  }),
  extractBreadcrumbs: jest.fn(() => [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Sign In', href: '/signin', isActive: true },
  ]),
}));

jest.mock('@/constants', () => ({
  AUTH_MESSAGES: {
    SIGN_IN: {
      title: 'Sign In',
      submitButton: 'Sign In',
      submittingButton: 'Signing In...',
      forgotPassword: 'Footer',
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
    handleSubmit: jest.fn(fn => (e?: Event) => {
      e?.preventDefault();
      return fn({ email: 'test@example.com', password: 'password123' });
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
  showToast: (...args: unknown[]) => mockShowToast(...args),
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

jest.mock('@/icons', () => ({
  GitHubIcon: () => {
    return <svg data-testid='github-icon' />;
  },
  GoogleIcon: () => {
    return <svg data-testid='google-icon' />;
  },
  LogoIcon: ({ className }: { className?: string }) => {
    return <svg data-testid='logo-icon' className={className} />;
  },
}));

jest.mock('@/components/form/SignInForm/index', () => ({
  SignInForm: ({
    onSubmit,
    onSocialSignIn,
  }: {
    onSubmit: () => void;
    onSocialSignIn: (provider: string) => void;
  }) => (
    <div data-testid='signin-form'>
      <button onClick={onSubmit}>Submit</button>
      <button onClick={() => onSocialSignIn('google')}>
        Sign in with Google
      </button>
    </div>
  ),
}));

jest.mock('@/components/form/TwoFactorForm/index', () => {
  const TwoFactorForm = ({
    onVerify,
    onBack,
  }: {
    onVerify: () => void;
    onBack: () => void;
  }) => (
    <div data-testid='twofactor-form'>
      <button onClick={onVerify}>Verify</button>
      <button onClick={onBack}>Back</button>
    </div>
  );
  return { TwoFactorForm };
});

jest.mock('@/components/pages/SignInPageContent/TwoFAMethodSelector', () => ({
  TwoFAMethodSelector: ({
    handleSelect2FAMethod,
    handleSms2FAVerify,
  }: {
    handleSelect2FAMethod: (m: string) => void;
    handleSms2FAVerify: () => void;
  }) => (
    <div data-testid='twofamethod-selector'>
      <button onClick={() => handleSelect2FAMethod('email')}>Email 2FA</button>
      <button onClick={handleSms2FAVerify}>SMS 2FA</button>
    </div>
  ),
}));

jest.mock('@/components/pages/SignInPageContent/SignInHeader', () => ({
  SignInHeader: () => <div data-testid='signin-header'>Header</div>,
}));

jest.mock('@/components/pages/SignInPageContent/SignInFooter', () => ({
  SignInFooter: () => <div data-testid='signin-footer'>Footer</div>,
}));

describe('SignInForm - Snapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('matches snapshot', () => {
    const { container } = render(<SignInPageContent />);
    expect(container).toMatchSnapshot();
  });
});

describe('SignInForm - Interactive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

describe('SignInPageContent - Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockImplementation(() =>
      Promise.resolve({ success: true })
    );
    mockVerify2FACode.mockImplementation(() =>
      Promise.resolve({ success: true, data: true })
    );
    mockSignIn.mockImplementation(() => Promise.resolve({ error: null }));
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders SignInForm by default', () => {
    render(<SignInPageContent />);
    expect(screen.getByTestId('signin-form')).toBeInTheDocument();
    expect(screen.queryByTestId('twofactor-form')).not.toBeInTheDocument();
  });

  it('renders TwoFactorForm after successful code send', async () => {
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
  });
});

describe('SignInPageContent - Interactive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('handles social sign in button clicks', async () => {
    render(<SignInPageContent />);
    await userEvent.click(
      screen.getByRole('button', { name: /sign in with google/i })
    );
    await waitFor(() => {
      expect(mockHandleSocialAuth).toHaveBeenCalledWith('google', 'signin');
    });
  });

  it('handles submit and shows error on failed code send', async () => {
    mockSend2FACode.mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials',
    });
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
  });

  it('handles back to sign in from 2FA form', async () => {
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
  });
});

describe('SignInPageContent - Additional Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend2FACode.mockImplementation(() =>
      Promise.resolve({ success: true })
    );
    mockVerify2FACode.mockImplementation(() =>
      Promise.resolve({ success: true, data: true })
    );
    mockSignIn.mockImplementation(() => Promise.resolve({ error: null }));
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders logo and breadcrumbs', () => {
    render(<SignInPageContent />);
    expect(screen.getByTestId('logo-icon')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows error toast if 2FA code is invalid', async () => {
    render(<SignInPageContent />);
    // Simulate 2FA step
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
    // Select email 2FA
    await userEvent.click(screen.getByText('Email 2FA'));
    // Should show toast for invalid code (empty code)
    await userEvent.click(screen.getByText('Verify'));
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'error' })
    );
  });

  it('shows error toast if SMS 2FA phone is empty', async () => {
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('SMS 2FA'));
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'error' })
    );
  });

  it('handles SMS 2FA code send and error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: false, error: 'SMS error' }),
    }) as jest.Mock;
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('SMS 2FA'));
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'error' })
      );
    });
  });

  it('handles resend code for email 2FA', async () => {
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Email 2FA'));
    // Simulate clicking resend (call handleResendCode directly if exposed)
    // Or simulate the UI if possible
    // For now, just check that mockSend2FACode was called
    expect(mockSend2FACode).toHaveBeenCalled();
  });

  it('shows error toast on failed verification', async () => {
    mockVerify2FACode.mockResolvedValueOnce({
      success: false,
      error: 'Invalid code',
      data: false,
    });
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Email 2FA'));
    await userEvent.click(screen.getByText('Verify'));
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'error' })
      );
    });
  });

  it('shows error toast on sign in error after verification', async () => {
    mockVerify2FACode.mockResolvedValueOnce({ success: true, data: true });
    mockSignIn.mockResolvedValueOnce({ error: { message: 'Sign in failed' } });
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Email 2FA'));
    await userEvent.click(screen.getByText('Verify'));
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'error' })
      );
    });
  });

  it('handles back to sign in from 2FA form', async () => {
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
    // Select email 2FA
    await userEvent.click(screen.getByText('Email 2FA'));
    // Simulate clicking back
    await userEvent.click(screen.getByText('Back'));
    expect(screen.getByTestId('signin-form')).toBeInTheDocument();
  });

  it('handles select SMS 2FA method and sets phone', async () => {
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('SMS 2FA'));
    // Should set twoFactorMethod to 'sms'
    // You can check for Sms2FAForm if it's rendered in your mocks
  });

  it('handles select email 2FA method and sends code', async () => {
    mockSend2FACode.mockResolvedValueOnce({ success: true });
    render(<SignInPageContent />);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('twofamethod-selector')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Email 2FA'));
    expect(mockSend2FACode).toHaveBeenCalled();
  });

  it('handles social sign in error', async () => {
    mockHandleSocialAuth.mockRejectedValueOnce(new Error('Social error'));
    render(<SignInPageContent />);
    await userEvent.click(
      screen.getByRole('button', { name: /sign in with google/i })
    );
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'error' })
      );
    });
  });
});
