'use client';

import { ChangeEvent, Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Components
import { getFriendlyMessage, Heading, showToast } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/common/Breadcrumb';

import { SignInForm, TwoFactorForm } from '@/components/form';

// Icons
import { LogoIcon } from '@/icons';

// Constants
import { AUTH_MESSAGES, ROUTES, TOAST_MESSAGES } from '@/constants';

// Types
import { TOAST_VARIANTS } from '@/types';

// Utils
import { handleSocialAuth } from '@/utils/social-auth';
import { extractBreadcrumbs, SignInFormValues, signInSchema } from '@/utils';

// Service
import { send2FACode, verify2FACode } from '@/service';
import { signIn } from '@/lib/auth-client';

const SignInPageContent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = extractBreadcrumbs(pathname);
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    setUserEmail(data.email);
    setUserPassword(data.password);

    try {
      const result = await send2FACode(data.email, data.password);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send verification code');
      }

      setRequires2FA(true);
      setIsLoading(false);

      showToast({
        title: 'Code Sent!',
        description:
          'Please check your email for the 6-digit verification code',
        variant: TOAST_VARIANTS.SUCCESS,
        duration: 5000,
      });

      return;
    } catch (error) {
      console.error('Sign in error:', error);
      showToast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to send verification code',
        variant: TOAST_VARIANTS.ERROR,
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerification = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      showToast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit code',
        variant: TOAST_VARIANTS.ERROR,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verify the email code
      const result = await verify2FACode(userEmail, twoFactorCode);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Invalid verification code');
      }

      const signInResult = await signIn.email({
        email: userEmail,
        password: userPassword,
      });

      if (signInResult.error) {
        throw new Error(signInResult.error.message || 'Sign in failed');
      }

      showToast({
        title: 'Success!',
        description: 'Successfully signed in!',
        variant: TOAST_VARIANTS.SUCCESS,
      });

      setUserPassword('');
      setTwoFactorCode('');
      router.push(ROUTES.HOME);
      router.refresh();
    } catch (error) {
      console.error('2FA verification error:', error);
      showToast({
        title: 'Verification Failed',
        description:
          error instanceof Error ? error.message : 'Invalid or expired code',
        variant: TOAST_VARIANTS.ERROR,
      });
      setIsLoading(false);
    }
  };

  // Resend code functionality
  const handleResendCode = async () => {
    if (!userEmail) return;

    setIsLoading(true);
    try {
      const result = await send2FACode(userEmail, userPassword);

      if (result.success) {
        showToast({
          title: 'Code Resent',
          description: 'A new code has been sent to your email',
          variant: TOAST_VARIANTS.SUCCESS,
        });
        // Reset code input
        setTwoFactorCode('');
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: getFriendlyMessage(error) ?? 'Failed to resend code',
        variant: TOAST_VARIANTS.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push(ROUTES.FORGOT_PASSWORD);
  };

  const handleTwoFactorCode = (e: ChangeEvent<HTMLInputElement>) => {
    //  Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setTwoFactorCode(value);
  };

  const handleBackToSignIn = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setUserEmail('');
    setUserPassword('');
  };

  const loading = isSubmitting || isLoading;

  return (
    <div className='flex flex-col items-center max-w-[1296px] mx-auto px-4 sm:px-6'>
      {/* Header Section */}
      <div className='pb-8 sm:pb-12 text-center'>
        <Heading
          as='h2'
          size='xl'
          content={AUTH_MESSAGES.SIGN_IN.title}
          className='text-3xl sm:text-5xl lg:text-6xl'
        />

        <Breadcrumb className='justify-center mt-3 sm:mt-4'>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <Fragment key={item.label}>
                <BreadcrumbItem>
                  {item.isActive ? (
                    <BreadcrumbPage className='text-sm sm:xs'>
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href} className='text-sm sm:xs'>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Form Section */}
      <div className='py-8 px-4 sm:py-14 sm:px-16 w-full lg:w-159 rounded-2xl sm:rounded-4xl border border-form-border-color shadow-form'>
        <div className='flex flex-col gap-6 sm:gap-10'>
          {/* Logo */}
          <div className='flex justify-center'>
            <Link
              href={ROUTES.HOME}
              className='flex items-center gap-2 sm:gap-3'
            >
              <LogoIcon className='w-8 h-8 sm:w-10 sm:h-10' />
              <span className='text-2xl sm:text-3xl font-secondary text-primary'>
                SaaS<span className='font-medium'>Candy</span>
              </span>
            </Link>
          </div>

          <div className='flex flex-col gap-6 sm:gap-8'>
            {/* Toggle between SignIn and 2FA forms */}
            {!requires2FA ? (
              <SignInForm
                control={control}
                onSubmit={handleSubmit(onSubmit)}
                onSocialSignIn={handleSocialSignIn}
                isLoading={loading}
              />
            ) : (
              <TwoFactorForm
                userEmail={userEmail}
                twoFactorCode={twoFactorCode}
                onCodeChange={handleTwoFactorCode}
                onVerify={handleTwoFactorVerification}
                onResendCode={handleResendCode}
                onBack={handleBackToSignIn}
                isLoading={loading}
              />
            )}

            {/* Footer Links */}
            <div className='text-center space-y-2 sm:space-y-3'>
              {!requires2FA && (
                <button
                  onClick={handleForgotPassword}
                  className='text-sm sm:text-md font-regular text-primary hover:text-primary/80 transition-colors'
                  disabled={loading}
                >
                  {AUTH_MESSAGES.SIGN_IN.forgotPassword}
                </button>
              )}

              <div className='text-sm sm:text-md font-regular text-primary'>
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
};

export { SignInPageContent };
