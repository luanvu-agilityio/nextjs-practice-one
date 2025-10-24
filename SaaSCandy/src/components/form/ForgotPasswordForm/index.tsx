'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Components
import { showToast } from '@/components/common/Toast';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Button, InputController } from '../../common';

// Utils
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from '@/utils/validation';

const ForgotPasswordForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: { email: string }) => {
    const res = await fetch('/api/auth/send-reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.success) {
      showToast({
        title: 'Email Sent',
        description: 'Check your inbox',
        variant: 'success',
      });
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
