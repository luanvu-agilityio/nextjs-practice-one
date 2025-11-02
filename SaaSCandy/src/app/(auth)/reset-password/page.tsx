'use client';
import ResetPasswordPageContent from '@/components/pages/ResetPasswordPageContent';
import { Suspense } from 'react';

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-light-gray'>
          <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  );
};
export default ResetPasswordPage;
