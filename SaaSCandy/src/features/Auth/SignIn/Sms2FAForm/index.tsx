'use client';
import { useForm } from 'react-hook-form';

// Components
import { Button, InputController, Input } from '@/components/ui';

// Utils
import { effectSchemaResolver } from '@/utils/effect-schema-resolver';
import { Sms2FASchema, Sms2FAFormData } from '@/utils/validation-effect';

interface Sms2FAFormProps {
  phone: string;
  code: string;
  setCode: (code: string) => void;
  onVerify: () => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

const Sms2FAForm = ({
  phone,
  code,
  setCode,
  onVerify,
  onResend,
  onBack,
  isLoading,
}: Sms2FAFormProps) => {
  const { control, handleSubmit } = useForm<Sms2FAFormData>({
    resolver: effectSchemaResolver(Sms2FASchema),
    defaultValues: { code },
  });

  const onSubmit = async (data: Sms2FAFormData) => {
    setCode(data.code);
    await onVerify();
  };

  return (
    <div className='max-w-sm mx-auto p-4 border rounded'>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <Input
          type='tel'
          value={phone}
          readOnly
          disabled
          className='w-full mb-2 p-2 border rounded bg-gray-100 text-gray-500'
          aria-label='Phone Number'
        />
        <InputController
          label='Enter Code'
          name='code'
          control={control}
          type='text'
          placeholder='6-digit code'
          required
        />
        <Button
          type='submit'
          variant='primary'
          size='large'
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </Button>
        <Button
          type='button'
          variant='secondary'
          size='large'
          onClick={onResend}
          disabled={isLoading}
        >
          Resend Code
        </Button>
        <Button type='button' variant='tertiary' size='large' onClick={onBack}>
          Back
        </Button>
      </form>
    </div>
  );
};

export { Sms2FAForm };
