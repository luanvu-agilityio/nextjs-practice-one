'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Better Auth
import { signUp } from '@/lib/auth-client';

// Components
import { Heading } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/common/Breadcrumb';
import { showToast } from '@/components/common/Toast';
import { SignUpForm } from './SignUpForm';

// Icons
import LogoIcon from '@/components/icons/Logo';

// Constants
import { AUTH_MESSAGES, ROUTES, TOAST_MESSAGES } from '@/constants';

// Types
import { TOAST_VARIANTS } from '@/types';

// Utils
import { extractBreadcrumbs, handleSocialAuth } from '@/utils/auth';
import { SignUpFormValues, signUpSchema } from '@/utils';

function SignUpPageContent() {
  const pathname = usePathname();
  const breadcrumbs = extractBreadcrumbs(pathname);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        showToast({
          title: TOAST_MESSAGES.SIGN_UP.ERROR.title,
          description:
            result.error.message || TOAST_MESSAGES.SIGN_UP.ERROR.description,
          variant: TOAST_VARIANTS.ERROR,
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      showToast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account.',
        variant: TOAST_VARIANTS.SUCCESS,
        duration: 7000,
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Sign up error:', error);
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
        description: TOAST_MESSAGES.SOCIAL.SIGNUP_ERROR.description.replace(
          '{provider}',
          provider
        ),
        variant: TOAST_VARIANTS.ERROR,
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  const loading = isSubmitting || isLoading;

  return (
    <div className='flex flex-col items-center max-w-[1296px] mx-auto px-4 sm:px-6'>
      {/* Header Section */}
      <div className='pb-8 sm:pb-12 text-center'>
        <Heading
          as='h1'
          size='xl'
          content={AUTH_MESSAGES.SIGN_UP.title}
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
            {/* Sign Up Form Component */}
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
        </div>
      </div>
    </div>
  );
}

export { SignUpPageContent };
