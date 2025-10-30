import { Heading, Button, Input, showToast } from '@/components/common';
import { AUTH_MESSAGES } from '@/constants/messages';

interface Props {
  userPhone: string;
  setUserPhone: (phone: string) => void;
  loading: boolean;
  handleSelect2FAMethod: (method: 'email' | 'sms') => void;
  handleSms2FAVerify: () => void;
}

const TwoFAMethodSelector = ({
  userPhone,
  setUserPhone,
  loading,
  handleSelect2FAMethod,
  handleSms2FAVerify,
}: Props) => (
  <div className='flex flex-col gap-4 items-center'>
    <Heading
      as='h3'
      size='md'
      className='mb-2'
      content={AUTH_MESSAGES.SIGN_IN.choose2FAMethodTitle}
    />
    <Button
      className='w-full mb-2'
      variant='primary'
      size='large'
      onClick={() => handleSelect2FAMethod('email')}
      disabled={loading}
    >
      {AUTH_MESSAGES.SIGN_IN.verifyViaEmail}
    </Button>
    <div className='w-full flex flex-col gap-2'>
      <Input
        type='tel'
        value={userPhone}
        onChange={e => setUserPhone(e.target.value)}
        placeholder={AUTH_MESSAGES.SIGN_IN.phonePlaceholder}
        disabled={loading}
        className='mb-2'
      />
      <Button
        className='w-full'
        variant='secondary'
        size='large'
        onClick={handleSms2FAVerify}
        disabled={loading}
      >
        {AUTH_MESSAGES.SIGN_IN.verifyViaSMS}
      </Button>
    </div>
  </div>
);

export { TwoFAMethodSelector };
