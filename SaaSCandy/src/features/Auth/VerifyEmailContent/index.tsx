'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Constants
import { ROUTES } from '@/constants';

// Components
import { Button, Heading, Typography } from '@/components/ui';

// Service
import { verifyEmail } from '@/service';
import { runAuthEffect } from '@/service/AuthService/helpers';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage(
          'Invalid verification link. Please request a new verification email.'
        );
        return;
      }

      try {
        const result = await runAuthEffect(verifyEmail(token));

        if (!result.success) {
          throw new Error(result.error || 'Verification failed');
        }

        setStatus('success');
        setMessage('Your email has been verified successfully!');

        setTimeout(() => {
          router.push(ROUTES.SIGN_IN);
        }, 3000);
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(
          'Verification failed. The link may have expired or is invalid.'
        );
      }
    };

    handleVerifyEmail();
  }, [token, router]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
        {status === 'verifying' && (
          <>
            <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4' />
            <Heading as='h3' size='md' content='Verifying Your Email...' />
            <Typography
              className='text-gray-background mt-2'
              content='Please wait while we verify your email address.'
            />
          </>
        )}

        {status === 'success' && (
          <>
            <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-4xl'>✓</span>
            </div>
            <Heading
              as='h3'
              size='md'
              content='Email Verified!'
              className='text-success-background'
            />
            <Typography
              className='text-gray-background mt-2'
              content={message}
            />
            <Typography
              className='text-sm text-gray-background mt-4'
              content='Redirecting to sign in page...'
            />
          </>
        )}

        {status === 'error' && (
          <>
            <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-4xl'>✕</span>
            </div>
            <Heading
              as='h3'
              size='md'
              content='Verification Failed'
              className='text-destructive-background'
            />
            <Typography
              className='text-gray-background mt-2'
              content={message}
            />
            <div className='flex flex-col gap-3 mt-6'>
              <Button
                variant='primary'
                onClick={() => router.push(ROUTES.SIGN_UP)}
              >
                Request New Verification Email
              </Button>
              <Button
                variant='secondary'
                onClick={() => router.push(ROUTES.SIGN_IN)}
              >
                Back to Sign In
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export { VerifyEmailContent };
