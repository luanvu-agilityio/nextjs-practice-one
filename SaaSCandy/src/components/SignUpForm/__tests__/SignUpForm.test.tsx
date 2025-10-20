// src/components/SignUpForm/__tests__/SignUpForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { SignUpForm } from '../SignUpForm';
import { SignUpFormValues } from '@/utils';

// Mock constants
jest.mock('@/constants', () => ({
  AUTH_MESSAGES: {
    SOCIAL: {
      googleSignIn: 'Sign In',
      githubSignIn: 'Sign In',
      googleSignUp: 'Sign Up',
      githubSignUp: 'Sign Up',
    },
    DIVIDER: 'or',
    SIGN_UP: {
      submitButton: 'Create Account',
      submittingButton: 'Creating Account...',
    },
  },
  SOCIAL_PROVIDERS: {
    GOOGLE: 'google',
    GITHUB: 'github',
  },
}));

// Mock icons
jest.mock('@/components/icons/GoogleIcon', () => {
  const MockGoogleIcon = () => <div>Google Icon</div>;
  MockGoogleIcon.displayName = 'GoogleIcon';
  return MockGoogleIcon;
});
jest.mock('@/components/icons/GitHubIcon', () => {
  const MockGitHubIcon = () => <div>GitHub Icon</div>;
  MockGitHubIcon.displayName = 'GitHubIcon';
  return MockGitHubIcon;
});

// Test wrapper component
function TestWrapper({ isLoading = false }: { isLoading?: boolean }) {
  const { control, handleSubmit } = useForm<SignUpFormValues>({
    defaultValues: { name: '', email: '', password: '' },
  });

  const mockSubmit = jest.fn();
  const mockSocialSignUp = jest.fn();

  return (
    <SignUpForm
      control={control}
      onSubmit={handleSubmit(mockSubmit)}
      onSocialSignUp={mockSocialSignUp}
      isLoading={isLoading}
    />
  );
}

describe('SignUpForm', () => {
  it('renders form elements correctly', () => {
    render(<TestWrapper />);

    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('renders social buttons', () => {
    render(<TestWrapper />);

    expect(screen.getAllByText('Sign Up').length).toBeGreaterThan(0);
  });

  it('shows loading state when submitting', () => {
    render(<TestWrapper isLoading={true} />);

    expect(screen.getByText('Creating Account...')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /creating account/i })
    ).toBeDisabled();
  });

  it('allows form input', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    const nameInput = screen.getByPlaceholderText('Full Name');
    await user.type(nameInput, 'John Doe');

    expect(nameInput).toHaveValue('John Doe');
  });
});
