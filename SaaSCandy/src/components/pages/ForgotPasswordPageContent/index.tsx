'use client';

import { ForgotPasswordForm } from '@/components/form';
import { Heading, Typography } from '@/components/common';

const ForgotPasswordPageContent = () => {
  return (
    <div className='mx-auto max-w-xl py-12'>
      <Heading
        as='h1'
        size='xl'
        content={'Forgot your password?'}
        className='mb-4'
      />
      <Typography size='md' className='mb-6 text-gray-background'>
        Enter your email and we&apos;ll send you a link to reset your password.
      </Typography>
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPasswordPageContent;
export { ForgotPasswordPageContent };
