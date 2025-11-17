import React from 'react';
import { z } from 'zod';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ReactNode } from 'react';
// Import mocked members directly (jest.mock will replace these during tests)
import { extractBreadcrumbs } from '@/utils';
import { signUp } from '@/lib/auth-client';
import { showToast } from '@/components/common/Toast';
import { handleSocialAuth } from '@/utils/social-auth';

// Router mock
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => '/signup',
  useRouter: () => ({ push: mockPush }),
}));

// Import component after mocks so mocked modules are used during module initialization

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
jest.mock('@/components/common/Toast', () => ({ showToast: jest.fn() }));

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
  // Values required by getFriendlyMessage / ErrorMessage
  ERROR_INSTANCE_KEYWORDS: {},
  GENERAL_MESSAGES: { SOMETHING_WRONG: 'Something went wrong' },
  HTTP_STATUS_MESSAGES: {},
  STRING_ERROR_KEYWORDS: {},
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

// Mock extractBreadcrumbs inside the factory (avoids hoisting issues).
// We'll retrieve the mock with jest.requireMock in tests when we need to change its return value.
jest.mock('@/utils', () => ({
  extractBreadcrumbs: jest.fn(() => [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Sign Up', href: '/signup', isActive: true },
  ]),
  // provide a minimal zod schema so zodResolver can validate in tests
  // permissive schema so handleSubmit will call onSubmit in tests
  signUpSchema: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
  }),
}));

// Mock ErrorMessage so we can spy/mock getFriendlyMessage safely
jest.mock('@/components/common/ErrorMessage', () => {
  const actual = jest.requireActual('@/components/common/ErrorMessage');
  return {
    ...actual,
    getFriendlyMessage: jest.fn((err: unknown) =>
      actual.getFriendlyMessage(err)
    ),
  };
});
import * as common from '@/components/common';
import * as ErrorMessageModule from '@/components/common/ErrorMessage';
import { SignUpPageContent } from '../index';

// Mock SignUpForm to control submit and social flows.
jest.mock('@/components/form', () => ({
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
    (signUp.email as jest.Mock).mockResolvedValue({ error: null });

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
    (signUp.email as jest.Mock).mockResolvedValue({
      error: { message: 'Bad' },
    });

    render(<SignUpPageContent />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Submit/i }));

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
    (handleSocialAuth as jest.Mock).mockResolvedValue(undefined);

    render(<SignUpPageContent />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Social SignUp/i }));

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
    (signUp.email as jest.Mock).mockResolvedValue({ error: null });

    render(<SignUpPageContent />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    const signInEl = await screen.findByText(/Already verified\? Sign In/i);
    await user.click(signInEl);

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('on signUp.email throwing shows error toast and does not show email-sent UI', async () => {
    // simulate a thrown error from the auth client
    (signUp.email as jest.Mock).mockImplementationOnce(() => {
      throw new Error('network');
    });

    render(<SignUpPageContent />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Sign Up Failed' })
      );
    });

    // Since an exception was thrown, the component should not show the email-sent UI
    expect(
      screen.queryByText('Verification Email Sent!')
    ).not.toBeInTheDocument();
  });

  it('social sign up failure shows signup error toast', async () => {
    (handleSocialAuth as jest.Mock).mockRejectedValueOnce(
      new Error('social fail')
    );

    render(<SignUpPageContent />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Social SignUp/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Social Signup Failed' })
      );
    });
  });

  it('social sign up failure calls getFriendlyMessage when available', async () => {
    // make getFriendlyMessage provide a human-friendly message
    const spy = jest
      .spyOn(common, 'getFriendlyMessage')
      .mockReturnValue('Friendly error');
    (handleSocialAuth as jest.Mock).mockRejectedValueOnce(
      new Error('social fail')
    );

    render(<SignUpPageContent />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Social SignUp/i }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Friendly error' })
      );
    });
    spy.mockRestore();
  });

  it('social sign up failure falls back to default description when getFriendlyMessage is empty', async () => {
    // Make getFriendlyMessage return undefined so fallback description is used
    jest
      .spyOn(ErrorMessageModule, 'getFriendlyMessage')
      .mockReturnValueOnce(undefined as unknown as string);
    (handleSocialAuth as jest.Mock).mockRejectedValueOnce(
      new Error('social fail')
    );

    render(<SignUpPageContent />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Social SignUp/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Failed to sign up with Google',
        })
      );
    });
  });

  it('on successful signUp.email shows success toast', async () => {
    // signUp.email resolves without error
    (signUp.email as jest.Mock).mockResolvedValue({ error: null });

    render(<SignUpPageContent />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(signUp.email).toHaveBeenCalled();
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Account Created!' })
      );
    });
  });

  it('on signUp.email error with no message uses default description', async () => {
    // error object with no message should use TOAST_MESSAGES fallback description
    (signUp.email as jest.Mock).mockResolvedValue({ error: {} });

    render(<SignUpPageContent />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sign Up Failed',
          description: 'Please try again.',
        })
      );
    });
  });

  it('breadcrumb: single item has no separators', () => {
    // set breadcrumbs to a single active item
    // Use mockImplementation to be robust against prior calls in other tests
    (extractBreadcrumbs as jest.Mock).mockImplementation(() => [
      { label: 'Only', href: '/only', isActive: true },
    ]);

    render(<SignUpPageContent />);
    const nav = screen.getByLabelText('breadcrumb');
    const separators = nav.querySelectorAll('li[role="presentation"]');
    expect(separators.length).toBe(0);
  });

  it('breadcrumb: multiple items render separators and links for non-active items', () => {
    (extractBreadcrumbs as jest.Mock).mockImplementation(() => [
      { label: 'Home', href: '/', isActive: false },
      { label: 'Section', href: '/section', isActive: false },
      { label: 'Sign Up', href: '/signup', isActive: true },
    ]);

    render(<SignUpPageContent />);
    const nav = screen.getByLabelText('breadcrumb');
    const separators = nav.querySelectorAll('li[role="presentation"]');
    expect(separators.length).toBe(2);

    const first = within(nav).getByText('Home');
    expect(first.closest('a')).not.toBeNull();
  });
});
