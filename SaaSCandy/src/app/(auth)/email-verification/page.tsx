'use client';

import { VerifyEmailContent } from '@/components';
import { Suspense } from 'react';

const VerifyEmailPage = () => {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-light-gray'>
          <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
};
export default VerifyEmailPage;
