'use client';

import { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Effect, pipe } from 'effect';

// Components
import { Button, getFriendlyMessage, showToast } from '@/components/ui';
import { SignInHeader } from './SignInHeader';
import { SignInFooter } from './SignInFooter';
import { TwoFAMethodSelector } from './TwoFAMethodSelector';
import { SignInForm } from './SignInForm';
import { TwoFactorForm } from './TwoFactorForm';
import { Sms2FAForm } from './Sms2FAForm';

// Icons
import { LogoIcon } from '@/icons';

// Constants
import { AUTH_MESSAGES, ROUTES, TOAST_MESSAGES } from '@/constants';

// Types
import { TOAST_VARIANTS } from '@/types';

// Utils
import { handleSocialAuth } from '@/utils/social-auth';
import { effectSchemaResolver } from '@/utils/effect-schema-resolver';
import { SignInFormData, SignInSchema } from '@/utils/validation-effect';

// Service
import { send2FACode, verify2FACode } from '@/service/AuthService';

// Helpers
import { signIn, getSession } from '@/lib/auth-client';
import { apiEffects } from '@/service/HttpClient/helper';

const SignInPageContent = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<
    'email' | 'sms' | null
  >(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [signedInUser, setSignedInUser] = useState<{
    email?: string;
    name?: string;
    id?: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInFormData>({
    resolver: effectSchemaResolver(SignInSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: SignInFormData) => {
    setIsLoading(true);
    setUserEmail(data.email);
    setUserPassword(data.password);
    setRequires2FA(true);
    setIsLoading(false);
  };

  // Change the handlers to return the Promise from Effect.runPromise

  const handleTwoFactorVerification = (): Promise<void> => {
    if (twoFactorCode?.length !== 6) {
      showToast({
        title: AUTH_MESSAGES.SIGN_IN.invalidCodeTitle || 'Invalid Code',
        description:
          AUTH_MESSAGES.SIGN_IN.invalidCodeDescription ||
          'Please enter a 6-digit code',
        variant: TOAST_VARIANTS.ERROR,
      });
      return Promise.resolve();
    }

    setIsLoading(true);

    const signInFlow = Effect.gen(function* () {
      // Step 1: Verify 2FA code
      let verificationResult;
      if (twoFactorMethod === 'email') {
        verificationResult = yield* verify2FACode(userEmail, twoFactorCode);
      } else {
        verificationResult = yield* apiEffects.verify2FASMS({
          phone: userPhone,
          code: twoFactorCode,
        });
      }

      const res = verificationResult as {
        success?: boolean;
        data?: boolean;
        error?: string;
      };
      if (!res?.success || res.data === false) {
        return yield* Effect.fail(
          new Error(
            res?.error ||
              AUTH_MESSAGES.SIGN_IN.verificationErrorDescription ||
              'Invalid verification code'
          )
        );
      }

      // Step 2: Sign in with email/password
      const signInResult = yield* Effect.promise(() =>
        signIn.email({
          email: userEmail,
          password: userPassword,
        })
      );

      const resultObj = signInResult as unknown as {
        error?: { message?: string };
        user?: { email?: string; name?: string; id?: string } | null;
      };

      if (resultObj.error) {
        return yield* Effect.fail(
          new Error(
            resultObj.error.message ||
              AUTH_MESSAGES.SIGN_IN.signInFailedDescription ||
              'Sign in failed'
          )
        );
      }

      // Step 3: Get session
      yield* Effect.promise(() => getSession()).pipe(
        Effect.catchAll(() => Effect.succeed(undefined))
      );

      // Step 4: Success actions
      setSignedInUser(resultObj.user ?? null);
      showToast({
        title: AUTH_MESSAGES.SIGN_IN.successTitle || 'Success!',
        description:
          AUTH_MESSAGES.SIGN_IN.successDescription || 'Successfully signed in!',
        variant: TOAST_VARIANTS.SUCCESS,
      });
      setUserPassword('');
      setTwoFactorCode('');
      setUserPhone('');

      setTimeout(() => {
        router.push(ROUTES.HOME);
        router.refresh();
      }, 900);

      return resultObj;
    }).pipe(
      Effect.catchAll(error =>
        Effect.sync(() => {
          showToast({
            title:
              AUTH_MESSAGES.SIGN_IN.verificationFailedTitle ||
              'Verification Failed',
            description:
              error instanceof Error
                ? error.message
                : AUTH_MESSAGES.SIGN_IN.verificationFailedDescription ||
                  'Invalid or expired code',
            variant: TOAST_VARIANTS.ERROR,
          });
        })
      ),
      Effect.tap(() => Effect.sync(() => setIsLoading(false))),
      Effect.asVoid
    );

    return Effect.runPromise(signInFlow).then(() => undefined);
  };

  const handleResendCode = async (): Promise<void> => {
    setIsLoading(true);

    const resendFlow = Effect.gen(function* () {
      let result;
      if (twoFactorMethod === 'email') {
        result = yield* send2FACode(userEmail, userPassword);
      } else {
        result = yield* pipe(
          apiEffects.send2FASMS({
            phone: userPhone,
            email: userEmail,
            password: userPassword,
          }),
          Effect.retry({ times: 1 })
        );
      }

      const res = result as { success?: boolean; error?: string };
      if (res.success) {
        const description =
          twoFactorMethod === 'email'
            ? AUTH_MESSAGES.SIGN_IN.codeResentEmailDescription ||
              'A new code has been sent to your email'
            : AUTH_MESSAGES.SIGN_IN.codeResentSMSDescription ||
              'A new code has been sent to your phone';

        showToast({
          title: AUTH_MESSAGES.SIGN_IN.codeResentTitle || 'Code Resent',
          description,
          variant: TOAST_VARIANTS.SUCCESS,
        });
        setTwoFactorCode('');
      }

      return result;
    }).pipe(
      Effect.catchAll(error =>
        Effect.sync(() => {
          showToast({
            title: AUTH_MESSAGES.SIGN_IN.codeResendErrorTitle || 'Error',
            description:
              getFriendlyMessage(error) ??
              (AUTH_MESSAGES.SIGN_IN.codeResendErrorDescription ||
                'Failed to resend code'),
            variant: TOAST_VARIANTS.ERROR,
          });
        })
      ),
      Effect.tap(() => Effect.sync(() => setIsLoading(false)))
    );

    await Effect.runPromise(resendFlow);
  };

  const handleSocialSignIn = async (provider: string): Promise<void> => {
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
    const value = e.target.value.replaceAll(/\D/g, '').slice(0, 6);
    setTwoFactorCode(value);
  };

  const handleBackToSignIn = () => {
    setRequires2FA(false);
    setTwoFactorMethod(null);
    setTwoFactorCode('');
    setUserEmail('');
    setUserPassword('');
    setUserPhone('');
  };

  const loading = isSubmitting || isLoading;

  const handleSelect2FAMethod = (method: 'email' | 'sms') => {
    setTwoFactorMethod(method);
    setTwoFactorCode('');
    if (method === 'sms') setUserPhone('');

    if (method === 'email') {
      setIsLoading(true);
      const sendCodeFlow = pipe(
        send2FACode(userEmail, userPassword),
        Effect.tap(result =>
          Effect.sync(() => {
            const res = result as { success?: boolean; error?: string };
            if (res.success) {
              showToast({
                title: AUTH_MESSAGES.SIGN_IN.smsCodeSentTitle,
                description: 'Check your email for the code',
                variant: TOAST_VARIANTS.SUCCESS,
              });
            } else {
              showToast({
                title: AUTH_MESSAGES.SIGN_IN.smsCodeErrorTitle,
                description:
                  res.error || AUTH_MESSAGES.SIGN_IN.smsCodeErrorDescription,
                variant: TOAST_VARIANTS.ERROR,
              });
            }
          })
        ),
        Effect.tap(() => Effect.sync(() => setIsLoading(false))),
        Effect.tap(() => Effect.sync(() => setIsLoading(false)))
      );

      Effect.runPromise(sendCodeFlow);
    }
  };

  const handleSms2FAVerify = () => {
    if (!userPhone) {
      showToast({
        title: AUTH_MESSAGES.SIGN_IN.phoneRequiredTitle,
        description: AUTH_MESSAGES.SIGN_IN.phoneRequiredDescription,
        variant: TOAST_VARIANTS.ERROR,
      });
      return;
    }

    const smsSendFlow = pipe(
      apiEffects.send2FASMS({
        phone: userPhone,
        email: userEmail,
        password: userPassword,
      }),
      Effect.tap(result =>
        Effect.sync(() => {
          const res = result as { success?: boolean; error?: string };
          if (res.success) {
            showToast({
              title: AUTH_MESSAGES.SIGN_IN.smsCodeSentTitle,
              description: AUTH_MESSAGES.SIGN_IN.smsCodeSentDescription,
              variant: TOAST_VARIANTS.SUCCESS,
            });
            setTwoFactorMethod('sms');
          } else {
            showToast({
              title: AUTH_MESSAGES.SIGN_IN.smsCodeErrorTitle,
              description:
                res.error || AUTH_MESSAGES.SIGN_IN.smsCodeErrorDescription,
              variant: TOAST_VARIANTS.ERROR,
            });
          }
        })
      ),
      Effect.catchAll(error =>
        Effect.sync(() => {
          showToast({
            title: AUTH_MESSAGES.SIGN_IN.smsCodeErrorTitle,
            description:
              getFriendlyMessage(error) ??
              AUTH_MESSAGES.SIGN_IN.smsCodeErrorDescription,
            variant: TOAST_VARIANTS.ERROR,
          });
        })
      ),
      Effect.tap(() => Effect.sync(() => setIsLoading(false)))
    );

    Effect.runPromise(smsSendFlow);
  };

  function render2FAStep() {
    if (!requires2FA) {
      return (
        <SignInForm
          control={control}
          onSubmit={handleSubmit(onSubmit)}
          onSocialSignIn={handleSocialSignIn}
          isLoading={loading}
        />
      );
    }
    if (!twoFactorMethod) {
      return (
        <TwoFAMethodSelector
          userPhone={userPhone}
          setUserPhone={setUserPhone}
          loading={loading}
          handleSelect2FAMethod={handleSelect2FAMethod}
          handleSms2FAVerify={handleSms2FAVerify}
        />
      );
    }
    if (twoFactorMethod === 'email') {
      return (
        <TwoFactorForm
          userEmail={userEmail}
          twoFactorCode={twoFactorCode}
          onCodeChange={handleTwoFactorCode}
          onVerify={handleTwoFactorVerification}
          onResendCode={handleResendCode}
          onBack={handleBackToSignIn}
          isLoading={loading}
        />
      );
    }
    return (
      <Sms2FAForm
        phone={userPhone}
        code={twoFactorCode}
        setCode={setTwoFactorCode}
        onVerify={handleTwoFactorVerification}
        onResend={handleResendCode}
        onBack={handleBackToSignIn}
        isLoading={loading}
      />
    );
  }

  return (
    <div className='flex flex-col items-center max-w-[1296px] mx-auto px-4 sm:px-6'>
      <SignInHeader />
      <div className='py-8 px-4 sm:py-14 sm:px-16 w-full lg:w-159 rounded-2xl sm:rounded-4xl border border-form-border-color shadow-form'>
        <div className='flex flex-col gap-6 sm:gap-10'>
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
          {signedInUser && (
            <div className='mx-auto w-full max-w-md bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md'>
              <div className='flex items-start gap-3'>
                <div className='flex-1 text-sm'>
                  Signed in as{' '}
                  <strong>
                    {signedInUser.name ?? signedInUser.email ?? 'user'}
                  </strong>
                </div>
                <div className='flex gap-2'>
                  <Button
                    className='bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700'
                    onClick={() => {
                      router.push(ROUTES.HOME);
                      router.refresh();
                    }}
                  >
                    Continue
                  </Button>
                  <Button
                    className='bg-transparent border border-green-600 text-green-600 px-3 py-1 rounded-md text-sm hover:bg-green-50'
                    onClick={() => setSignedInUser(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className='flex flex-col gap-6 sm:gap-8'>
            {render2FAStep()}
            <SignInFooter
              loading={loading}
              requires2FA={requires2FA}
              handleForgotPassword={handleForgotPassword}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { SignInPageContent };
