'use server';

import { redirect } from 'next/navigation';
import { authApi } from '@/api';
import { ROUTES } from '@/constants';
import type { AuthState } from '@/types';

export async function signInAction(formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    // Validate with MockAPI
    const response = await authApi.login({ email, password });

    if (!response.user) {
      return {
        error: 'Invalid email or password',
        success: undefined,
        user: undefined,
        credentials: undefined,
      };
    }

    return {
      success: true,
      user: response.user,
      credentials: { email, password },
      error: undefined,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      error: error instanceof Error ? error.message : 'Sign in failed',
      success: undefined,
      user: undefined,
      credentials: undefined,
    };
  }
}

export async function signUpAction(formData: FormData): Promise<AuthState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const [firstName, lastName] = name.split(' ');

    const response = await authApi.register({
      email,
      password,
      firstName: firstName || name,
      lastName: lastName || '',
    });

    if (!response.user) {
      return {
        error: 'Registration failed',
        success: undefined,
        user: undefined,
        credentials: undefined,
      };
    }

    return {
      success: true,
      user: response.user,
      credentials: { email, password },
      error: undefined,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      error: error instanceof Error ? error.message : 'Sign up failed',
      success: undefined,
      user: undefined,
      credentials: undefined,
    };
  }
}

export async function signOutAction() {
  redirect(ROUTES.HOME);
}
