'use server';

import { signIn } from 'next-auth/react';

// API
import { authApi } from '@/api';

// Constants
import { AUTH_ROUTES } from '@/constants/auth-routes';

// Server Action for Sign In
export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const response = await authApi.login({ email, password });

    if (!response.user) {
      return {
        error: {
          status: 401,
          message: 'Invalid credentials',
        },
      };
    }

    return {
      success: true,
      user: response.user,
      credentials: { email, password },
    };
  } catch (error) {
    console.error('Sign in API error:', error);

    return { error };
  }
}

export async function signUpAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const { firstName, lastName } = extractNames(name);

    const response = await authApi.register({
      firstName,
      lastName,
      email,
      password,
    });

    return {
      success: true,
      user: response.user,
      credentials: { email, password },
    };
  } catch (error) {
    console.error('Sign up API error:', error);

    return { error };
  }
}

// Server Action for Social Sign In
export async function socialSignInAction(provider: string) {
  try {
    await signIn(provider, { callbackUrl: AUTH_ROUTES.HOME });
  } catch (error) {
    console.error(`Social sign in error (${provider}):`, error);
    return { error: `Failed to sign in with ${provider}` };
  }
}

// Helper function to extract first and last name
function extractNames(fullName: string) {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}
