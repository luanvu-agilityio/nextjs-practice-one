import { signIn } from '@/lib/auth-client';

/**
 * Handles social authentication for sign-in or sign-up using supported providers.
 *
 * @param provider - The social provider name ('google' or 'github').
 * @param action - The authentication action ('signin' or 'signup').
 * @throws Will throw an error if authentication fails.
 *
 * Usage:
 *   await handleSocialAuth('google', 'signin');
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
