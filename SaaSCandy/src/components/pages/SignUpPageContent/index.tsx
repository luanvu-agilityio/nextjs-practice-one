'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Better Auth
import { signUp } from '@/lib/auth-client';

// Components
import {
  Heading,
  Typography,
  getFriendlyMessage,
  showToast,
} from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/common/Breadcrumb';
import { SignUpForm } from '@/components/form';

// Icons
import { LogoIcon } from '@/icons';

// Constants
import { AUTH_MESSAGES, ROUTES, TOAST_MESSAGES } from '@/constants';

// Types
import { TOAST_VARIANTS } from '@/types';

// Utils
import { handleSocialAuth } from '@/utils/social-auth';
import { extractBreadcrumbs, SignUpFormValues, signUpSchema } from '@/utils';

function SignUpPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = extractBreadcrumbs(pathname);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    console.log('[SignUpForm] 📝 Sign up form submitted');
    console.log('[SignUpForm] Email:', data.email, 'Name:', data.name);

    setIsLoading(true);
    setUserEmail(data.email);

    try {
      console.log('[SignUpForm] ℹ️ Calling Better Auth signUp.email API');

      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      console.log(
        '[SignUpForm] ℹ️ Sign up result:',
        result.error ? 'ERROR' : 'SUCCESS'
      );

      if (result.error) {
        console.log('[SignUpForm] ❌ Sign up failed:', result.error.message);
        showToast({
          title: TOAST_MESSAGES.SIGN_UP.ERROR.title,
          description:
            result.error.message || TOAST_MESSAGES.SIGN_UP.ERROR.description,
          variant: TOAST_VARIANTS.ERROR,
          duration: 5000,
        });
        setEmailSent(true);
        setIsLoading(false);
        return;
      }

      console.log('[SignUpForm] ✅ Account created successfully');
      console.log('[SignUpForm] ℹ️ Verification email sent to:', data.email);

      setEmailSent(true);

      showToast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account.',
        variant: TOAST_VARIANTS.SUCCESS,
        duration: 7000,
      });

      setIsLoading(false);
    } catch (error) {
      console.error('[SignUpForm] ❌ Exception:', error);
      showToast({
        title: TOAST_MESSAGES.SIGN_UP.ERROR.title,
        description: TOAST_MESSAGES.SIGN_UP.ERROR.description,
        variant: TOAST_VARIANTS.ERROR,
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: string) => {
    setIsLoading(true);

    try {
      await handleSocialAuth(provider, 'signup');

      showToast({
        title: TOAST_MESSAGES.SOCIAL.SIGNUP_REDIRECT.title,
        description: TOAST_MESSAGES.SOCIAL.SIGNUP_REDIRECT.description.replace(
          '{provider}',
          provider
        ),
        variant: TOAST_VARIANTS.INFO,
        duration: 3000,
      });
    } catch (error) {
      showToast({
        title: TOAST_MESSAGES.SOCIAL.SIGNUP_ERROR.title,
        description:
          getFriendlyMessage(error) ??
          TOAST_MESSAGES.SOCIAL.SIGNUP_ERROR.description.replace(
            '{provider}',
            provider
          ),
        variant: TOAST_VARIANTS.ERROR,
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  const handleSignIn = () => router.push(ROUTES.SIGN_IN);

  const loading = isSubmitting || isLoading;

  return (
    <div className='flex flex-col items-center max-w-[1296px] mx-auto px-4 sm:px-6'>
      {/* Header Section */}
      <div className='pb-8 sm:pb-12 text-center'>
        <Heading
          as='h1'
          size='xl'
          content={emailSent ? 'Check Your Email' : AUTH_MESSAGES.SIGN_UP.title}
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
                    <BreadcrumbLink
                      href={item.href}
                      className='text-sm sm:text-xs'
                    >
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

          {emailSent ? (
            // Email Sent Confirmation
            <div className='space-y-6 text-center'>
              <div className='w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center'>
                <svg
                  className='w-10 h-10 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                  />
                </svg>
              </div>

              <div>
                <Heading
                  as='h2'
                  size='md'
                  content='Verification Email Sent!'
                  className='text-2xl sm:text-3xl mb-3'
                />
                <Typography className=' sm:text-lg text-gray-background'>
                  We&apos;ve sent a verification link to{' '}
                  <strong className='text-primary break-all'>
                    {userEmail}
                  </strong>
                </Typography>
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-2'>
                <Typography className='text-sm sm:text-xs text-blue-800'>
                  <strong>Next steps:</strong>
                </Typography>
                <ol className='list-decimal list-inside text-sm sm:text-xs text-blue-700 space-y-1'>
                  <li>Check your email inbox</li>
                  <li>Click the verification link</li>
                  <li>You&apos;ll be automatically signed in</li>
                </ol>
                <Typography
                  className='text-xs sm:text-sm text-blue-600 mt-3'
                  content="Didn't receive it? Check your spam folder"
                />
              </div>

              <div className='pt-4 space-y-3'>
                <button
                  onClick={handleSignIn}
                  className='text-sm sm:text-xs text-primary hover:underline'
                >
                  Already verified? Sign In
                </button>
              </div>
            </div>
          ) : (
            // Sign Up Form
            <div className='flex flex-col gap-6 sm:gap-8'>
              <SignUpForm
                control={control}
                onSubmit={handleSubmit(onSubmit)}
                onSocialSignUp={handleSocialSignUp}
                isLoading={loading}
              />

              {/* Footer Links */}
              <div className='text-center space-y-2 sm:space-y-3'>
                <div className='text-sm sm:text-md font-regular text-primary'>
                  {AUTH_MESSAGES.SIGN_UP.privacyText}{' '}
                  <Link
                    href={ROUTES.PRIVACY}
                    className='text-primary font-medium hover:underline'
                  >
                    {AUTH_MESSAGES.SIGN_UP.privacyLink}
                  </Link>
                </div>

                <div className='text-sm sm:text-md font-regular text-primary'>
                  {AUTH_MESSAGES.SIGN_UP.alreadyMember}{' '}
                  <Link
                    href={ROUTES.SIGN_IN}
                    className='text-primary font-medium hover:underline'
                  >
                    {AUTH_MESSAGES.SIGN_UP.signInLink}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { SignUpPageContent };
