import { ROUTES } from '@/constants';
import { signIn } from '@/lib/auth-client';

/**
 * Extract breadcrumbs from pathname
 */
export const extractBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = [{ label: 'Home', href: ROUTES.HOME, isActive: false }];

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    const isActive = index === segments.length - 1;

    breadcrumbs.push({
      label: label
        .replace('signin', 'Sign In')
        .replace('signup', 'Sign Up')
        .replace('account', 'Account'),
      href,
      isActive,
    });
  });

  return breadcrumbs;
};

/**
 * Handle social authentication
 */
export const handleSocialAuth = async (
  provider: string,
  action: 'signin' | 'signup'
) => {
  try {
    await signIn.social({
      provider: provider.toLowerCase() as 'google' | 'github',
      callbackURL: '/',
    });
  } catch (error) {
    console.error(`Social ${action} error:`, error);
    throw error;
  }
};
