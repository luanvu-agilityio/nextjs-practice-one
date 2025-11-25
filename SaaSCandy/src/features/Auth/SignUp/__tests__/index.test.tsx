import React from 'react';
import { z } from 'zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ReactNode } from 'react';
import { SignUpPageContent } from '../index';

// Router mock
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => '/signup',
  useRouter: () => ({ push: mockPush }),
}));

// Simple next/link mock
jest.mock('next/link', () => {
  return function MockLink(props: { children?: ReactNode; href?: string }) {
    const { children, href } = props;
    return <a href={href}>{children}</a>;
  };
});

// Mock signUp client with typed mocks
jest.mock('@/lib/auth-client', () => ({ signUp: { email: jest.fn() } }));

// Mock toast
jest.mock('@/components/ui/Toast', () => ({ showToast: jest.fn() }));

// Mock constants used in the component
jest.mock('@/constants', () => ({
  AUTH_MESSAGES: {
    SIGN_UP: {
      title: 'Create Your Account',
      alreadyMember: 'Already have an account?',
      signInLink: 'Sign In',
      privacyText: 'By signing up, you agree to our',
      privacyLink: 'Privacy Policy',
    },
  },
  ROUTES: {
    HOME: '/',
    SIGN_IN: '/signin',
    PRIVACY: '/privacy',
  },
  TOAST_MESSAGES: {
    SIGN_UP: {
      ERROR: { title: 'Sign Up Failed', description: 'Please try again.' },
    },
    SOCIAL: {
      SIGNUP_REDIRECT: {
        title: 'Redirecting',
        description: 'You will be redirected to {provider}',
      },
      SIGNUP_ERROR: {
        title: 'Social Signup Failed',
        description: 'Failed to sign up with {provider}',
      },
    },
  },
}));

// Mock social auth util
jest.mock('@/utils/social-auth', () => ({ handleSocialAuth: jest.fn() }));

// Mock extractBreadcrumbs
jest.mock('@/utils', () => ({
  extractBreadcrumbs: () => [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Sign Up', href: '/signup', isActive: true },
  ],
  // provide a minimal zod schema so zodResolver can validate in tests
  // permissive schema so handleSubmit will call onSubmit in tests
  signUpSchema: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
  }),
}));

// Mock SignUpForm to control submit and social flows.
jest.mock('../SignUpForm/index', () => ({
  SignUpForm: (props: {
    control: unknown;
    onSubmit: (data: { name: string; email: string; password: string }) => void;
    onSocialSignUp: (provider: string) => void;
    isLoading?: boolean;
  }) => {
    const { onSubmit, onSocialSignUp } = props;
    return (
      <div>
        <input placeholder='Full Name' />
        <input placeholder='Email' />
        <input placeholder='Password' />
        <button
          onClick={() =>
            onSubmit({
              name: 'Jane',
              email: 'jane@example.com',
              password: 'pass',
            })
          }
        >
          Submit
        </button>
        <button onClick={() => onSocialSignUp('Google')}>Social SignUp</button>
      </div>
    );
  },
}));

describe('SignUpPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup page with form and footer links', () => {
    render(<SignUpPageContent />);

    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByText('SaaS')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();

    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('on successful signUp.email shows email sent UI and stores email', async () => {
    // signUp.email resolves without error
    const { signUp } = jest.requireMock('@/lib/auth-client') as {
      signUp: { email: jest.Mock };
    };
    signUp.email.mockResolvedValue({ error: null });

    render(<SignUpPageContent />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(signUp.email).toHaveBeenCalled();
    });

    // After success, the verification UI should be shown
    expect(
      await screen.findByText('Verification Email Sent!')
    ).toBeInTheDocument();
  });

  it('on signUp.email error shows toast and still shows email-sent UI', async () => {
    const { signUp } = jest.requireMock('@/lib/auth-client') as {
      signUp: { email: jest.Mock };
    };
    signUp.email.mockResolvedValue({ error: { message: 'Bad' } });

    render(<SignUpPageContent />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    const { showToast } = jest.requireMock('@/components/ui/Toast') as {
      showToast: jest.Mock;
    };

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Sign Up Failed' })
      );
    });

    // component sets emailSent true even on error per implementation
    expect(
      await screen.findByText('Verification Email Sent!')
    ).toBeInTheDocument();
  });

  it('handles social sign up and shows redirect toast', async () => {
    const { handleSocialAuth } = jest.requireMock('@/utils/social-auth') as {
      handleSocialAuth: jest.Mock;
    };
    handleSocialAuth.mockResolvedValue(undefined);

    render(<SignUpPageContent />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Social SignUp/i }));

    const { showToast } = jest.requireMock('@/components/ui/Toast') as {
      showToast: jest.Mock;
    };

    await waitFor(() => {
      expect(handleSocialAuth).toHaveBeenCalledWith('Google', 'signup');
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Redirecting',
          variant: expect.any(String),
        })
      );
    });
  });

  it("'Already verified? Sign In' navigates to sign in", async () => {
    const { signUp } = jest.requireMock('@/lib/auth-client') as {
      signUp: { email: jest.Mock };
    };
    signUp.email.mockResolvedValue({ error: null });

    render(<SignUpPageContent />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    const signInEl = await screen.findByText(/Already verified\? Sign In/i);
    await user.click(signInEl);

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });
});
