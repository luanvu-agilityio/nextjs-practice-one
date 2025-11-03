'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Components
import {
  showToast,
  ErrorMessage,
  Button,
  InputController,
  getFriendlyMessage,
} from '@/components/common';

// Utils
import { ResetPasswordFormData, resetPasswordSchema } from '@/utils/validation';

// Service
import { resetPassword } from '@/service';

// Types
import { TOAST_VARIANTS } from '@/types';

type ResetPasswordFormProps = {
  token?: string;
  onSuccess?: () => void;
  onError?: (message?: string) => void;
};

const ResetPasswordForm = ({
  token,
  onSuccess,
  onError,
}: ResetPasswordFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async ({ newPassword }: { newPassword: string }) => {
    try {
      const data = await resetPassword(token ?? '', newPassword);

      if (data.success) {
        showToast({
          title: 'Password Updated',
          description: 'You can now sign in.',
          variant: TOAST_VARIANTS.SUCCESS,
        });
        onSuccess?.();
      } else {
        const msg = data.message ?? 'Failed to reset password';
        showToast({
          title: 'Error',
          description: getFriendlyMessage(msg),
          variant: TOAST_VARIANTS.ERROR,
        });
        onError?.(msg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast({
        title: 'Error',
        description: getFriendlyMessage(msg),
        variant: TOAST_VARIANTS.ERROR,
      });
      onError?.(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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
      <Button type='submit' className='mt-6'>
        Change Password
      </Button>
    </form>
  );
};

export { ResetPasswordForm };
