'use client';
import { useForm } from 'react-hook-form';

// Components
import { showToast } from '@/components/ui/Toast';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button, InputController } from '@/components/ui';

// Utils
import { effectSchemaResolver } from '@/utils/effect-schema-resolver';
import {
  ForgotPasswordFormData,
  ForgotPasswordSchema,
} from '@/utils/validation-effect';

// Constant
import { API_ROUTES } from '@/constants';

// Types
import { TOAST_VARIANTS } from '@/types';

const ForgotPasswordForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: effectSchemaResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: { email: string }) => {
    const res = await fetch(API_ROUTES.AUTH.SEND_RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.success) {
      showToast({
        title: 'Email Sent',
        description: 'Check your inbox',
        variant: TOAST_VARIANTS.SUCCESS,
      });
    } else {
      showToast({
        title: 'Error',
        description: data.message,
        variant: TOAST_VARIANTS.ERROR,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <InputController
        name='email'
        control={control}
        label='Email'
        placeholder='Enter your email'
        type='email'
        required
      />
      {errors.email && <ErrorMessage error={errors.email.message} />}
      <Button type='submit'>Send Reset Link</Button>
    </form>
  );
};

export { ForgotPasswordForm };
