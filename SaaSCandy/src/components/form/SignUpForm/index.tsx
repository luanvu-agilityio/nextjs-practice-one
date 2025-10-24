'use client';

import { Control } from 'react-hook-form';

// Components
import { Button, Divider, InputController } from '@/components/common';
import { SocialButton } from '@/components';

// Icons
import { GoogleIcon, GitHubIcon } from '@/icons';

// Constants
import { AUTH_MESSAGES, SOCIAL_PROVIDERS } from '@/constants';

// Types
import { SignUpFormValues } from '@/utils';

interface SignUpFormProps {
  control: Control<SignUpFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onSocialSignUp: (provider: string) => Promise<void>;
  isLoading: boolean;
}

const SignUpForm = ({
  control,
  onSubmit,
  onSocialSignUp,
  isLoading,
}: SignUpFormProps) => {
  return (
    <>
      {/* Social Sign Up Buttons */}
      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
        <SocialButton
          provider='google'
          icon={GoogleIcon}
          onClick={() => onSocialSignUp(SOCIAL_PROVIDERS.GOOGLE)}
          disabled={isLoading}
          className='w-full'
        >
          <span className='hidden sm:inline'>
            {AUTH_MESSAGES.SOCIAL.googleSignUp}
          </span>
          <span className='sm:hidden'>Google</span>
        </SocialButton>

        <SocialButton
          provider='github'
          icon={GitHubIcon}
          onClick={() => onSocialSignUp(SOCIAL_PROVIDERS.GITHUB)}
          disabled={isLoading}
          className='w-full'
        >
          <span className='hidden sm:inline'>
            {AUTH_MESSAGES.SOCIAL.githubSignUp}
          </span>
          <span className='sm:hidden'>GitHub</span>
        </SocialButton>
      </div>

      <Divider
        text={AUTH_MESSAGES.DIVIDER}
        className='text-gray-background text-sm sm:xs'
      />

      {/* Sign Up Form */}
      <form onSubmit={onSubmit} className='space-y-3 sm:space-y-4' noValidate>
        <InputController
          name='name'
          control={control}
          label='Full Name'
          placeholder='Full Name'
          type='text'
          autoComplete='name'
          hideLabel
          required
        />

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
          autoComplete='new-password'
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
          {isLoading
            ? AUTH_MESSAGES.SIGN_UP.submittingButton
            : AUTH_MESSAGES.SIGN_UP.submitButton}
        </Button>
      </form>
    </>
  );
};

export { SignUpForm };
