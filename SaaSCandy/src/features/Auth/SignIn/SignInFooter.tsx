import Link from 'next/link';

import { AUTH_MESSAGES, ROUTES } from '@/constants';

const SignInFooter = ({
  loading,
  requires2FA,
  handleForgotPassword,
}: {
  loading: boolean;
  requires2FA: boolean;
  handleForgotPassword: () => void;
}) => (
  <div className='text-center space-y-2 sm:space-y-3'>
    {!requires2FA && (
      <button
        onClick={handleForgotPassword}
        className='text-sm sm:text-md font-regular text-primary hover:text-primary/80 transition-colors'
        disabled={loading}
      >
        {AUTH_MESSAGES.SIGN_IN.forgotPassword}
      </button>
    )}
    <div className='text-sm sm:text-md font-regular text-primary'>
      {AUTH_MESSAGES.SIGN_IN.notMember}{' '}
      <Link
        href={ROUTES.SIGN_UP}
        className='text-primary font-medium hover:underline'
      >
        {AUTH_MESSAGES.SIGN_IN.signUpLink}
      </Link>
    </div>
  </div>
);

export { SignInFooter };
