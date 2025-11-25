'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from '@/lib/auth-client';

// Components
import { Button, InputController, ErrorMessage } from '@/components/ui';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components';

// Utils
import { effectSchemaResolver } from '@/utils/effect-schema-resolver';
import {
  EditProfileFormData,
  EditProfileSchema,
} from '@/utils/validation-effect';

// Service
import { updateProfileAsync } from '@/service';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditProfileModal = ({
  open,
  onOpenChange,
  onSuccess,
}: Readonly<EditProfileModalProps>) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user;

  const { control, handleSubmit, reset } = useForm<EditProfileFormData>({
    resolver: effectSchemaResolver(EditProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user?.id) {
      setError('User session not found');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

      const result = await updateProfileAsync({
        name: fullName,
        email: data.email,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // Reload to refresh session
      window.location.reload();

      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        reset();
      }, 100);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
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
};

export { EditProfileModal };
