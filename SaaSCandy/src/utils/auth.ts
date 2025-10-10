import { AUTH_ROUTES } from '@/constants/auth-routes';
import { signIn, signOut } from 'next-auth/react';

export const handleSocialAuth = async (
  provider: string,
  action: 'signin' | 'signup' = 'signin'
) => {
  try {
    await signIn(provider, {
      callbackUrl: AUTH_ROUTES.HOME,
      // Add redirect parameter to distinguish between sign in and sign up
      redirect: true,
    });
  } catch (error) {
    console.error(`Social ${action} error (${provider}):`, error);
    throw new Error(`Failed to ${action} with ${provider}`);
  }
};

export const handleSignOut = async (
  callbackUrl: string = AUTH_ROUTES.SIGN_IN
) => {
  try {
    await signOut({ callbackUrl });
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

export const extractBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = [
    { label: 'Home', href: AUTH_ROUTES.HOME, isActive: false },
  ];

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    const isActive = index === segments.length - 1;

    breadcrumbs.push({
      label: label.replace('signin', 'Sign In').replace('signup', 'Sign Up'),
      href,
      isActive,
    });
  });

  return breadcrumbs;
};
