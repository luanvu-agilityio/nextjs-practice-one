import { Heading } from '@/components/common';
import { AUTH_MESSAGES } from '@/constants/messages';

const SignInHeader = () => (
  <div className='pb-8 sm:pb-12 text-center'>
    <Heading
      as='h2'
      size='xl'
      content={AUTH_MESSAGES.SIGN_IN.title}
      className='text-3xl sm:text-5xl lg:text-6xl'
    />
  </div>
);

export { SignInHeader };
