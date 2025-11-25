'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from '@/lib/auth-client';

// Components
import {
  Button,
  showToast,
  ErrorMessage,
  InputController,
} from '@/components/ui';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components';

// Utils
import { effectSchemaResolver } from '@/utils/effect-schema-resolver';
import {
  ChangePasswordFormData,
  ChangePasswordSchema,
} from '@/utils/validation-effect';

// Types
import { TOAST_VARIANTS } from '@/types';

// Service
import { changePasswordAsync } from '@/service';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ChangePasswordModal = ({
  open,
  onOpenChange,
  onSuccess,
}: Readonly<ChangePasswordModalProps>) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user;

  const { control, handleSubmit, reset } = useForm<ChangePasswordFormData>({
    resolver: effectSchemaResolver(ChangePasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!user?.id) {
      setError('User session not found');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await changePasswordAsync(
        data.currentPassword,
        data.newPassword
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update password');
      }

      showToast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
        variant: TOAST_VARIANTS.SUCCESS,
        duration: 3000,
      });

      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        reset();
      }, 100);
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
};

export { ChangePasswordModal };
