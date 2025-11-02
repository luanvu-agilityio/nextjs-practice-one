'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Button,
  InputController,
  showToast,
  Heading,
} from '@/components/common';
import { resetPasswordSchema } from '@/utils';
import { resetPassword } from '@/service';
import { TOAST_VARIANTS } from '@/types';

const ResetPasswordPageContent = () => {
  const search = useSearchParams();
  const token = search?.get('token') || '';
  const router = useRouter();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: { newPassword: string }) => {
    if (!token) {
      showToast({
        title: 'Error',
        description: 'Missing token',
        variant: TOAST_VARIANTS.ERROR,
      });
      return;
    }
    try {
      const res = await resetPassword(token, data.newPassword);
      if (!res.success) {
        showToast({
          title: 'Error',
          description: res.error || 'Failed to reset password',
          variant: TOAST_VARIANTS.ERROR,
        });
        return;
      }
      showToast({
        title: 'Success',
        description: 'Password has been reset. Please sign in.',
        variant: TOAST_VARIANTS.SUCCESS,
      });
      router.push('/signin');
    } catch (err) {
      console.error('[reset-password] error', err);
      showToast({
        title: 'Error',
        description: 'Failed to reset password',
        variant: TOAST_VARIANTS.ERROR,
      });
    }
  };

  return (
    <div className='max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm'>
      <Heading as='h2' size='md' content={'Reset Password'} className='mb-4' />
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <InputController
          name='newPassword'
          label='New Password'
          control={control}
          type='password'
          placeholder='Enter new password'
        />
        <InputController
          name='confirmPassword'
          label='Confirm Password'
          control={control}
          type='password'
          placeholder='Confirm new password'
        />
        <div className='flex justify-end'>
          <Button type='submit'>Reset Password</Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPageContent;
