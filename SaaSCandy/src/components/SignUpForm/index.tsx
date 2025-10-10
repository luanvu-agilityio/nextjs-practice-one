'use client';

import { Fragment, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';

// Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Divider,
  Heading,
  InputController,
} from '../common';
import { showToast } from '../common/Toast';
import SocialButton from '../SocialButton';

// Icons
import LogoIcon from '../icons/Logo';
import GoogleIcon from '../icons/GoogleIcon';
import GitHubIcon from '../icons/GitHubIcon';

// Constants
import {
  AUTH_MESSAGES,
  AUTH_ROUTES,
  SOCIAL_PROVIDERS,
  TOAST_MESSAGES,
} from '@/constants';

// Utils
import { signUpSchema, SignUpFormValues } from '@/utils/validation';
import { signUpAction } from '@/lib/auth';
import { extractBreadcrumbs, handleSocialAuth } from '@/utils';

// Types
import { AuthState } from '@/types';

function SignUpForm() {
  const pathname = usePathname();
  const breadcrumbs = extractBreadcrumbs(pathname);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    clearErrors,
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

  const [serverState, serverAction, isPending] = useActionState(
    async (_prevState: AuthState, formData: FormData) => {
      return await signUpAction(formData);
    },
    { error: null }
  );

  // Handle client form submission
  const onSubmit = async (data: SignUpFormValues) => {
    clearErrors('root');

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);

    serverAction(formData);
  };

  // Handle server response with Toast notifications
  useEffect(() => {
    // Handle success
    if (serverState.success && serverState.credentials) {
      showToast({
        title: TOAST_MESSAGES.SIGN_UP.SUCCESS.title,
        description: TOAST_MESSAGES.SIGN_UP.SUCCESS.description,
        variant: 'success',
        duration: 3000,
      });

      // Auto sign in after successful registration
      signIn('credentials', {
        email: serverState.credentials.email,
        password: serverState.credentials.password,
        callbackUrl: AUTH_ROUTES.HOME,
      }).catch(() => {
        showToast({
          title: TOAST_MESSAGES.SIGN_UP.AUTO_SIGNIN_FAILED.title,
          description: TOAST_MESSAGES.SIGN_UP.AUTO_SIGNIN_FAILED.description,
          variant: 'warning',
          duration: 6000,
        });
      });
    }

    // Handle error
    if (serverState.error) {
      let errorMessage = TOAST_MESSAGES.SIGN_UP.ERROR.description;

      if (typeof serverState.error === 'string') {
        errorMessage = serverState.error;
      } else if (serverState.error instanceof Error) {
        errorMessage = serverState.error.message;
      }

      showToast({
        title: TOAST_MESSAGES.SIGN_UP.ERROR.title,
        description: errorMessage,
        variant: 'error',
        duration: 5000,
      });
    }
  }, [serverState]);

  const handleSocialSignUp = async (provider: string) => {
    try {
      await handleSocialAuth(provider, 'signup');

      showToast({
        title: TOAST_MESSAGES.SOCIAL.SIGNUP_REDIRECT.title,
        description: TOAST_MESSAGES.SOCIAL.SIGNUP_REDIRECT.description.replace(
          '{provider}',
          provider
        ),
        variant: 'info',
        duration: 3000,
      });
    } catch (error) {
      console.error('Social sign-up error:', error);
      showToast({
        title: TOAST_MESSAGES.SOCIAL.SIGNUP_ERROR.title,
        description: TOAST_MESSAGES.SOCIAL.SIGNUP_ERROR.description.replace(
          '{provider}',
          provider
        ),
        variant: 'error',
        duration: 5000,
      });
    }
  };

  const isLoading = isSubmitting || isPending;

  return (
    <div className='flex flex-col items-center max-w-[1296px] mx-auto'>
      {/* Header Section */}
      <div className='pb-12'>
        <Heading as='h1' size='xl' content={AUTH_MESSAGES.SIGN_UP.title} />

        {/* Breadcrumb */}
        <Breadcrumb className='justify-center mt-4'>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <Fragment key={item.label}>
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
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Form Section */}
      <div className='py-14 px-16 w-159 rounded-4xl border border-form-border-color shadow-form'>
        <div className='flex flex-col gap-10'>
          {/* Logo */}
          <div className='flex justify-center'>
            <Link href={AUTH_ROUTES.HOME} className='flex items-center gap-3'>
              <LogoIcon className='w-10 h-10' />
              <span className='text-3xl font-secondary text-primary'>
                SaaS<span className='font-medium'>Candy</span>
              </span>
            </Link>
          </div>

          <div className='flex flex-col gap-8'>
            {/* Social Sign Up Buttons */}
            <div className='flex flex-row gap-4'>
              <SocialButton
                provider='google'
                icon={GoogleIcon}
                onClick={() => handleSocialSignUp(SOCIAL_PROVIDERS.GOOGLE)}
                disabled={isLoading}
              >
                {AUTH_MESSAGES.SOCIAL.googleSignUp}
              </SocialButton>

              <SocialButton
                provider='github'
                icon={GitHubIcon}
                onClick={() => handleSocialSignUp(SOCIAL_PROVIDERS.GITHUB)}
                disabled={isLoading}
              >
                {AUTH_MESSAGES.SOCIAL.githubSignUp}
              </SocialButton>
            </div>

            <Divider
              text={AUTH_MESSAGES.DIVIDER}
              className='text-gray-background'
            />

            {/* Client-side validated form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='space-y-4'
              noValidate
            >
              <InputController
                name='name'
                control={control}
                label='Name'
                placeholder='Name'
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

            {/* Footer Links */}
            <div className='text-center space-y-3'>
              <div className='text-md font-regular text-primary'>
                {AUTH_MESSAGES.SIGN_UP.privacyText}{' '}
                <Link
                  href={AUTH_ROUTES.PRIVACY}
                  className='text-primary font-medium hover:underline'
                >
                  {AUTH_MESSAGES.SIGN_UP.privacyLink}
                </Link>
              </div>

              <div className='text-md font-regular text-primary'>
                {AUTH_MESSAGES.SIGN_UP.alreadyMember}{' '}
                <Link
                  href={AUTH_ROUTES.SIGN_IN}
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

export default SignUpForm;
