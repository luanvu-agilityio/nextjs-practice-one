'use client';

import { useSearchParams, useRouter } from 'next/navigation';

// Components
import { showToast, Heading } from '@/components/common';
import { ResetPasswordForm } from '@/components/form';

// Constants
import { ROUTES } from '@/constants';

// Types
import { TOAST_VARIANTS } from '@/types';

const ResetPasswordPageContent = () => {
  const search = useSearchParams();
  const token = search?.get('token') || '';
  const router = useRouter();

  const handleSuccess = () => {
    showToast({
      title: 'Success',
      description: 'Password has been reset. Please sign in.',
      variant: TOAST_VARIANTS.SUCCESS,
    });
    router.push(ROUTES.SIGN_IN);
  };

  return (
    <div className='max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm'>
      <Heading as='h2' size='md' content={'Reset Password'} className='mb-4' />
      <ResetPasswordForm token={token} onSuccess={handleSuccess} />
    </div>
  );
};

export default ResetPasswordPageContent;
