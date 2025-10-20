import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { SignUpPageContent } from '../index';

// Mock Next.js
jest.mock('next/navigation', () => ({
  usePathname: () => '/signup',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('next/link', () => {
  return function MockLink(props: { children?: ReactNode; href?: string }) {
    const { children, href } = props;
    return <a href={href}>{children}</a>;
  };
});

// Mock auth client
jest.mock('@/lib/auth-client', () => ({
  signUp: {
    email: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/common/Toast', () => ({
  showToast: jest.fn(),
}));

// Mock constants
jest.mock('@/constants', () => ({
  AUTH_MESSAGES: {
    SIGN_UP: {
      title: 'Create Your Account',
      alreadyMember: 'Already have an account?',
      signInLink: 'Sign In',
      privacyText: 'By signing up, you agree to our',
      privacyLink: 'Privacy Policy',
    },
    SOCIAL: {
      googleSignIn: 'Sign In',
      githubSignIn: 'Sign In',
      googleSignUp: 'Sign Up',
      githubSignUp: 'Sign Up',
    },
  },
  ROUTES: {
    HOME: '/',
    SIGN_IN: '/signin',
    PRIVACY: '/privacy',
  },
  TOAST_MESSAGES: {
    SIGN_UP: {
      ERROR: {
        title: 'Sign Up Failed',
        description: 'Please try again.',
      },
    },
  },
}));

// Mock utils
jest.mock('@/utils/auth', () => ({
  extractBreadcrumbs: () => [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Sign Up', href: '/signup', isActive: true },
  ],
  handleSocialAuth: jest.fn(),
}));

describe('SignUpPageContent', () => {
  it('renders signup page with form', () => {
    render(<SignUpPageContent />);

    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByText('SaaS')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
  });

  it('renders breadcrumbs', () => {
    render(<SignUpPageContent />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getAllByText('Sign Up').length).toBeGreaterThan(0);
  });

  it('renders footer links', () => {
    render(<SignUpPageContent />);

    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });
});
