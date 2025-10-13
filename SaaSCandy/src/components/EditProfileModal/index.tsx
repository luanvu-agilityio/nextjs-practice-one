'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession['user'];
  }
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

// Components
import { Button } from '@/components/common';
import { InputController } from '@/components/common/InputController';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components';

// API
import { authApi } from '@/api/auth';

// Utils
import { EditProfileFormData, editProfileSchema } from '@/utils';
import { ErrorMessage } from '../common/ErrorMessage';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function EditProfileModal({
  open,
  onOpenChange,
  onSuccess,
}: Readonly<EditProfileModalProps>) {
  const { data: session, update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: session?.user?.name?.split(' ')[0] || '',
      lastName: session?.user?.name?.split(' ')[1] || '',
      email: session?.user?.email || '',
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

      const updatedUser = await authApi.updateUser(session.user.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        name: fullName,
        email: data.email,
      });

      await update({
        ...session,
        user: {
          ...session.user,
          name: updatedUser.name || fullName,
          email: updatedUser.email,
        },
      });

      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        reset();
      }, 100);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to update profile'
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
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {error && <ErrorMessage customMessage={error} />}

          <div className='grid grid-cols-2 gap-4'>
            <InputController
              name='firstName'
              label='First Name'
              control={control}
              placeholder='Enter first name'
              disabled={isSubmitting}
            />
            <InputController
              name='lastName'
              label='Last Name'
              control={control}
              placeholder='Enter last name'
              disabled={isSubmitting}
            />
          </div>

          <InputController
            name='email'
            label='Email Address'
            control={control}
            type='email'
            placeholder='Enter email address'
            disabled={isSubmitting}
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditProfileModal;
