'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

// Components
import {
  showToast,
  ErrorMessage,
  Button,
  InputController,
  getFriendlyMessage,
} from '@/components/ui';

// Utils
import { effectSchemaResolver } from '@/utils/effect-schema-resolver';
import {
  ResetPasswordFormData,
  ResetPasswordSchema,
} from '@/utils/validation-effect';

// Service
import { resetPasswordAsync } from '@/service';

// Constants
import { ROUTES } from '@/constants';

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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: effectSchemaResolver(ResetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async ({ newPassword }: { newPassword: string }) => {
    setIsSubmitting(true);

    try {
      const data = await resetPasswordAsync(token ?? '', newPassword);

      if (data.success) {
        // Reset form to initial state
        reset();

        showToast({
          title: 'Password Updated',
          description:
            'Your password has been changed successfully. Redirecting to sign in...',
          variant: TOAST_VARIANTS.SUCCESS,
        });

        onSuccess?.();

        // Redirect to sign-in page after a short delay
        setTimeout(() => {
          router.push(ROUTES.SIGN_IN);
        }, 2000);
      } else {
        const msg = data.message ?? 'Failed to reset password';
        showToast({
          title: 'Error',
          description: getFriendlyMessage(msg),
          variant: TOAST_VARIANTS.ERROR,
        });
        onError?.(msg);
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast({
        title: 'Error',
        description: getFriendlyMessage(msg),
        variant: TOAST_VARIANTS.ERROR,
      });
      onError?.(msg);
      setIsSubmitting(false);
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
        disabled={isSubmitting}
        required
      />
      <InputController
        name='confirmPassword'
        control={control}
        label='Confirm Password'
        placeholder='Confirm new password'
        type='password'
        disabled={isSubmitting}
        required
      />
      {errors.newPassword && (
        <ErrorMessage
          error={errors.newPassword.message}
          testId='error-newPassword'
        />
      )}
      {errors.confirmPassword && (
        <ErrorMessage
          error={errors.confirmPassword.message}
          testId='error-confirmPassword'
        />
      )}
      <Button type='submit' className='mt-6' disabled={isSubmitting}>
        {isSubmitting ? 'Updating Password...' : 'Change Password'}
      </Button>
    </form>
  );
};

export { ResetPasswordForm };
