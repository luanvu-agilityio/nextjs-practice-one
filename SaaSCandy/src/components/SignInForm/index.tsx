'use client';

import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Components
import { Button, Heading, Divider, InputController } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/common/Breadcrumb';
import { showToast } from '@/components/common/Toast';
import SocialButton from '@/components/SocialButton';

// Icons
import LogoIcon from '@/components/icons/Logo';
import GoogleIcon from '@/components/icons/GoogleIcon';
import GitHubIcon from '@/components/icons/GitHubIcon';
// Constants
import {
  AUTH_MESSAGES,
  ROUTES,
  SOCIAL_PROVIDERS,
  TOAST_MESSAGES,
} from '@/constants';

// Types
import { AuthState, TOAST_VARIANTS } from '@/types';

// Utils
import { extractBreadcrumbs, handleSocialAuth } from '@/utils/auth';
import { signInAction } from '@/lib/auth';
import { SignInFormValues, signInSchema } from '@/utils';

function SignInForm() {
  const pathname = usePathname();
  const breadcrumbs = extractBreadcrumbs(pathname);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    clearErrors,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const [serverState, serverAction, isPending] = useActionState(
    async (_prevState: AuthState, formData: FormData) => {
      return await signInAction(formData);
    },
    { error: null }
  );

  const onSubmit = async (data: SignInFormValues) => {
    clearErrors('root');

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    serverAction(formData);
  };

  // Handle server response with Toast notifications
  useEffect(() => {
    // Handle success
    if (serverState.success && serverState.credentials) {
      showToast({
        title: TOAST_MESSAGES.SIGN_IN.SUCCESS.title,
        description: TOAST_MESSAGES.SIGN_IN.SUCCESS.description,
        variant: TOAST_VARIANTS.SUCCESS,
        duration: 3000,
      });

      // Auto sign in with NextAuth
      signIn('credentials', {
        email: serverState.credentials.email,
        password: serverState.credentials.password,
        callbackUrl: ROUTES.HOME,
      }).catch(() => {
        showToast({
          title: TOAST_MESSAGES.SIGN_IN.AUTH_ERROR.title,
          description: TOAST_MESSAGES.SIGN_IN.AUTH_ERROR.description,
          variant: TOAST_VARIANTS.ERROR,
          duration: 5000,
        });
      });
    }

    // Handle error
    if (serverState.error) {
      showToast({
        title: TOAST_MESSAGES.SIGN_IN.ERROR.title,
        description:
          typeof serverState.error === 'string'
            ? serverState.error
            : TOAST_MESSAGES.SIGN_IN.ERROR.description,
        variant: TOAST_VARIANTS.ERROR,
        duration: 5000,
      });
    }
  }, [serverState]);

  const isLoading = isSubmitting || isPending;

  const handleSocialSignIn = async (provider: string) => {
    try {
      await handleSocialAuth(provider, 'signin');

      showToast({
        title: TOAST_MESSAGES.SOCIAL.SIGNIN_REDIRECT.title,
        description: TOAST_MESSAGES.SOCIAL.SIGNIN_REDIRECT.description.replace(
          '{provider}',
          provider
        ),
        variant: TOAST_VARIANTS.INFO,
        duration: 3000,
      });
    } catch (error) {
      console.error('Social sign-in error:', error);
      showToast({
        title: TOAST_MESSAGES.SOCIAL.SIGNIN_ERROR.title,
        description: TOAST_MESSAGES.SOCIAL.SIGNIN_ERROR.description.replace(
          '{provider}',
          provider
        ),
        variant: TOAST_VARIANTS.ERROR,
        duration: 5000,
      });
    }
  };

  const handleForgotPassword = () => {
    showToast({
      title: TOAST_MESSAGES.FEATURES.FORGOT_PASSWORD.title,
      description: TOAST_MESSAGES.FEATURES.FORGOT_PASSWORD.description,
      variant: TOAST_VARIANTS.INFO,
      duration: 4000,
    });
  };

  return (
    <div className='flex flex-col items-center max-w-[1296px] mx-auto'>
      {/* Header Section */}
      <div className='pb-12'>
        <Heading as='h1' size='xl' content={AUTH_MESSAGES.SIGN_IN.title} />

        {/* Breadcrumb */}
        <Breadcrumb className='justify-center mt-4'>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.label}>
                <BreadcrumbItem>
                  {item.isActive ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Form Section */}
      <div className='py-14 px-16 w-159 rounded-4xl border border-form-border-color shadow-form'>
        <div className='flex flex-col gap-10'>
          {/* Logo */}
          <div className='flex justify-center'>
            <Link href={ROUTES.HOME} className='flex items-center gap-3'>
              <LogoIcon className='w-10 h-10' />
              <span className='text-3xl font-secondary text-primary'>
                SaaS<span className='font-medium'>Candy</span>
              </span>
            </Link>
          </div>

          <div className='flex flex-col gap-8'>
            {/* Social Sign In Buttons */}
            <div className='flex flex-row gap-4'>
              <SocialButton
                provider='google'
                icon={GoogleIcon}
                onClick={() => handleSocialSignIn(SOCIAL_PROVIDERS.GOOGLE)}
                disabled={isLoading}
              >
                {AUTH_MESSAGES.SOCIAL.googleSignIn}
              </SocialButton>

              <SocialButton
                provider='github'
                icon={GitHubIcon}
                onClick={() => handleSocialSignIn(SOCIAL_PROVIDERS.GITHUB)}
                disabled={isLoading}
              >
                {AUTH_MESSAGES.SOCIAL.githubSignIn}
              </SocialButton>
            </div>

            <Divider
              text={AUTH_MESSAGES.DIVIDER}
              className='text-gray-background'
            />

            {/* Sign In Form with Server Action */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='space-y-4'
              noValidate
            >
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
                {isLoading
                  ? AUTH_MESSAGES.SIGN_IN.submittingButton
                  : AUTH_MESSAGES.SIGN_IN.submitButton}
              </Button>
            </form>

            {/* Footer Links */}
            <div className='text-center space-y-3'>
              <button
                onClick={handleForgotPassword}
                className='text-md font-regular text-primary hover:text-primary/80 transition-colors'
                disabled={isLoading}
              >
                {AUTH_MESSAGES.SIGN_IN.forgotPassword}
              </button>

              <div className='text-md font-regular text-primary'>
                {AUTH_MESSAGES.SIGN_IN.notMember}{' '}
                <Link
                  href={ROUTES.SIGN_UP}
                  className='text-primary font-medium hover:underline'
                >
                  {AUTH_MESSAGES.SIGN_IN.signUpLink}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInForm;
