'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';

// Components
import { Button } from '@/components/common';
import { ErrorMessage } from '../common/ErrorMessage';
import { InputController } from '@/components/common/InputController';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components';

// API
import { authApi } from '@/api/auth';

// Utils
import { ChangePasswordFormData, changePasswordSchema } from '@/utils';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ChangePasswordModal({
  open,
  onOpenChange,
  onSuccess,
}: Readonly<ChangePasswordModalProps>) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,

    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await authApi.updateUser(session.user.id, {
        newPassword: data.newPassword,
      });
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to change password'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {error && <ErrorMessage customMessage={error} />}

          <InputController
            name='currentPassword'
            label='Current Password'
            control={control}
            type='password'
            placeholder='Enter current password'
            disabled={isSubmitting}
            showPasswordToggle
          />

          <InputController
            name='newPassword'
            label='New Password'
            control={control}
            type='password'
            placeholder='Enter new password'
            disabled={isSubmitting}
            showPasswordToggle
          />

          <InputController
            name='confirmPassword'
            label='Confirm New Password'
            control={control}
            type='password'
            placeholder='Confirm new password'
            disabled={isSubmitting}
            showPasswordToggle
          />

          <DialogFooter>
            <Button
              type='button'
              variant='secondary'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' variant='primary' disabled={isSubmitting}>
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePasswordModal;
