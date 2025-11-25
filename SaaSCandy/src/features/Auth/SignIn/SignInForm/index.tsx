'use client';

import { Control } from 'react-hook-form';

// Components
import {
  Button,
  Divider,
  InputController,
  SocialButton,
} from '@/components/ui';

// Icons
import { GoogleIcon, GitHubIcon } from '@/icons';

// Constants
import { AUTH_MESSAGES, SOCIAL_PROVIDERS } from '@/constants';

// Types
import { SignInFormData } from '@/utils/validation-effect';
import { BaseSyntheticEvent } from 'react';

interface SignInFormProps {
  control: Control<SignInFormData>;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  onSocialSignIn: (provider: string) => Promise<void>;
  isLoading: boolean;
}

const SignInForm = ({
  control,
  onSubmit,
  onSocialSignIn,
  isLoading,
}: SignInFormProps) => {
  return (
    <>
      {/* Social Sign In Buttons */}
      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
        <SocialButton
          provider='google'
          icon={GoogleIcon}
          onClick={() => onSocialSignIn(SOCIAL_PROVIDERS.GOOGLE)}
          disabled={isLoading}
          className='w-full'
        >
          <span className='hidden sm:inline'>
            {AUTH_MESSAGES.SOCIAL.googleSignIn}
          </span>
          <span className='sm:hidden'>Google</span>
        </SocialButton>

        <SocialButton
          provider='github'
          icon={GitHubIcon}
          onClick={() => onSocialSignIn(SOCIAL_PROVIDERS.GITHUB)}
          disabled={isLoading}
          className='w-full'
        >
          <span className='hidden sm:inline'>
            {AUTH_MESSAGES.SOCIAL.githubSignIn}
          </span>
          <span className='sm:hidden'>GitHub</span>
        </SocialButton>
      </div>

      <Divider
        text={AUTH_MESSAGES.DIVIDER}
        className='text-gray-background text-sm sm:xs'
      />

      {/* Email/Password Form */}
      <form onSubmit={onSubmit} className='space-y-3 sm:space-y-4' noValidate>
        <InputController
          name='email'
          control={control}
          label='Email'
          placeholder='Email'
          type='email'
          autoComplete='email'
          hideLabel
          required
        />

        <InputController
          name='password'
          control={control}
          label='Password'
          placeholder='Password'
          type='password'
          autoComplete='current-password'
          showPasswordToggle
          hideLabel
          required
        />

        <Button
          type='submit'
          variant='primary'
          size='large'
          disabled={isLoading}
          className='w-full'
        >
          {isLoading ? 'Sending Code...' : AUTH_MESSAGES.SIGN_IN.submitButton}
        </Button>
      </form>
    </>
  );
};

export { SignInForm };
