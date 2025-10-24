'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useRouter } from 'next/navigation';

// Components
import {
  showToast,
  ErrorMessage,
  Button,
  InputController,
} from '@/components/common';

// Utils
import { ResetPasswordFormData, resetPasswordSchema } from '@/utils/validation';

const ResetPasswordForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const onSubmit = async ({ newPassword }: { newPassword: string }) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.success) {
      showToast({
        title: 'Password Updated',
        description: 'You can now sign in.',
        variant: 'success',
      });
      router.push('/signin');
    } else {
      showToast({
        title: 'Error',
        description: data.message,
        variant: 'error',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputController
        name='newPassword'
        control={control}
        label='New Password'
        placeholder='Enter new password'
        type='password'
        required
      />
      <InputController
        name='confirmPassword'
        control={control}
        label='Confirm Password'
        placeholder='Confirm new password'
        type='password'
        required
      />
      {errors.newPassword && (
        <ErrorMessage error={errors.newPassword.message} />
      )}
      {errors.confirmPassword && (
        <ErrorMessage error={errors.confirmPassword.message} />
      )}
      <Button type='submit'>Change Password</Button>
    </form>
  );
};

export { ResetPasswordForm };
