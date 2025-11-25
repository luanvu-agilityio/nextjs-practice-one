'use client';

import { ChangeEvent } from 'react';

// Components
import { Button, Heading, Typography } from '@/components/ui';
import { Input } from '@/components/ui/Input';

interface TwoFactorFormProps {
  userEmail: string;
  twoFactorCode: string;
  onCodeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onVerify: () => Promise<void>;
  onResendCode: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

const TwoFactorForm = ({
  userEmail,
  twoFactorCode,
  onCodeChange,
  onVerify,
  onResendCode,
  onBack,
  isLoading,
}: TwoFactorFormProps) => {
  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* Email Notification */}
      <div className='bg-blue-foreground border border-form-border-color rounded-lg p-3 sm:p-4'>
        <div className='text-center'>
          <Typography
            className=' sm:text-lg font-medium text-blue-background'
            content=' Check your email'
          />
          <Typography className='text-sm sm:text-lg text-blue-background mt-1 break-words'>
            We sent a 6-digit code to{' '}
            <strong className='break-all'>{userEmail}</strong>
          </Typography>
        </div>
      </div>

      {/* Instructions */}
      <div className='text-center'>
        <Heading
          as='h3'
          size='md'
          content='Enter Verification Code'
          className='text-xl sm:text-2xl'
        />
        <Typography
          className='text-sm sm:text-lg text-gray-background mt-1'
          content='Enter the 6-digit code from your email'
        />
      </div>

      {/* Code Input */}
      <Input
        type='text'
        value={twoFactorCode}
        onChange={onCodeChange}
        className='block w-full px-3 py-2 border border-gray-foreground rounded-md text-center text-xl sm:text-2xl tracking-widest font-mono'
        placeholder='000000'
        maxLength={6}
        autoFocus
      />

      <Typography
        className='text-sm sm:text-lg text-gray-background text-center'
        content='Code expires in 10 minutes'
      />

      {/* Verify Button */}
      <Button
        onClick={onVerify}
        disabled={isLoading || twoFactorCode.length !== 6}
        variant='primary'
        size='large'
        className='w-full'
      >
        {isLoading ? 'Verifying...' : 'Verify & Sign In'}
      </Button>

      {/* Actions */}
      <div className='flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0'>
        <button
          type='button'
          onClick={onResendCode}
          disabled={isLoading}
          className='text-sm sm:text-md text-primary hover:underline disabled:opacity-50'
        >
          Resend Code
        </button>

        <Button
          onClick={onBack}
          variant='secondary'
          className='text-sm sm:text-md text-gray-background hover:text-gray-foreground w-full sm:w-auto'
        >
          Change Email
        </Button>
      </div>
    </div>
  );
};
export { TwoFactorForm };
