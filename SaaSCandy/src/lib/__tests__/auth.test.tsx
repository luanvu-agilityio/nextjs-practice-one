import { signInAction, signUpAction, signOutAction } from '../auth';
import { authApi } from '@/api';
import { ROUTES } from '@/constants';

jest.mock('@/api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

import { redirect } from 'next/navigation';

describe('auth actions', () => {
  it('signInAction returns success with valid credentials', async () => {
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');
    (authApi.login as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
    });

    const result = await signInAction(formData);
    expect(result.success).toBe(true);
    expect(result.user).toEqual({ id: '1', email: 'test@example.com' });
    expect(result.error).toBeUndefined();
  });

  it('signUpAction returns error if registration fails', async () => {
    const formData = new FormData();
    formData.set('name', 'Test User');
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');
    (authApi.register as jest.Mock).mockResolvedValue({ user: undefined });

    const result = await signUpAction(formData);
    expect(result.success).toBeUndefined();
    expect(result.error).toBe('Registration failed');
    it('signOutAction calls redirect to home', async () => {
      await signOutAction();
      expect(redirect).toHaveBeenCalledWith(ROUTES.HOME);
    });
    expect(redirect).toHaveBeenCalledWith(ROUTES.HOME);
  });
});
