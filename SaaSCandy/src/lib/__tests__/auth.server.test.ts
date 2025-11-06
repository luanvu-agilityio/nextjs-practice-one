import { signInAction, signUpAction, signOutAction } from '../auth';
import { ROUTES } from '@/constants';

// Mock the auth API used by the actions
jest.mock('@/api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

// Mock next/navigation redirect
const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

import { authApi } from '@/api';

function makeFormData(entries: Record<string, string>): FormData {
  // Use native FormData when available (jsdom). Otherwise provide minimal polyfill.
  if (typeof FormData !== 'undefined') {
    const fd = new FormData();
    for (const [k, v] of Object.entries(entries)) {
      fd.append(k, v);
    }
    return fd;
  }

  return {
    get: (key: string) => entries[key],
  } as unknown as FormData;
}

describe('auth server actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInAction', () => {
    it('returns success and user when authApi.login returns user', async () => {
      (authApi.login as jest.Mock).mockResolvedValue({
        user: { id: '1', email: 'a@b.com' },
      });

      const fd = makeFormData({ email: 'a@b.com', password: 'pw' });
      const result = await signInAction(fd);

      expect(result.success).toBe(true);
      expect(result.user).toEqual({ id: '1', email: 'a@b.com' });
      expect(result.credentials).toEqual({ email: 'a@b.com', password: 'pw' });
      expect(result.error).toBeUndefined();
    });

    it('returns error when authApi.login returns no user', async () => {
      (authApi.login as jest.Mock).mockResolvedValue({ user: undefined });

      const fd = makeFormData({ email: 'x@y.com', password: 'pw' });
      const result = await signInAction(fd);

      expect(result.success).toBeUndefined();
      expect(result.user).toBeUndefined();
      expect(result.credentials).toBeUndefined();
      expect(result.error).toMatch(/Invalid email or password/);
    });

    it('catches and returns error message on exception', async () => {
      (authApi.login as jest.Mock).mockRejectedValue(new Error('network'));

      const fd = makeFormData({ email: 'err@x.com', password: 'pw' });
      const result = await signInAction(fd);

      expect(result.success).toBeUndefined();
      expect(result.user).toBeUndefined();
      expect(result.error).toContain('network');
    });
  });

  describe('signUpAction', () => {
    it('returns success and user when authApi.register returns user', async () => {
      (authApi.register as jest.Mock).mockResolvedValue({
        user: { id: '2', email: 's@b.com' },
      });

      const fd = makeFormData({
        name: 'Sam Doe',
        email: 's@b.com',
        password: 'pw',
      });
      const result = await signUpAction(fd);

      expect(result.success).toBe(true);
      expect(result.user).toEqual({ id: '2', email: 's@b.com' });
      expect(result.credentials).toEqual({ email: 's@b.com', password: 'pw' });
      expect(result.error).toBeUndefined();
    });

    it('returns error when register returns no user', async () => {
      (authApi.register as jest.Mock).mockResolvedValue({ user: undefined });

      const fd = makeFormData({
        name: 'No User',
        email: 'no@u.com',
        password: 'pw',
      });
      const result = await signUpAction(fd);

      expect(result.success).toBeUndefined();
      expect(result.user).toBeUndefined();
      expect(result.credentials).toBeUndefined();
      expect(result.error).toMatch(/Registration failed/);
    });

    it('catches and returns error message on exception', async () => {
      (authApi.register as jest.Mock).mockRejectedValue(new Error('boom'));

      const fd = makeFormData({
        name: 'Err',
        email: 'e@err.com',
        password: 'pw',
      });
      const result = await signUpAction(fd);

      expect(result.success).toBeUndefined();
      expect(result.user).toBeUndefined();
      expect(result.error).toContain('boom');
    });
  });

  describe('signOutAction', () => {
    it('calls redirect to home', async () => {
      await signOutAction();

      expect(mockRedirect).toHaveBeenCalled();
      // optionally assert route if ROUTES exported value is stable
      expect(mockRedirect).toHaveBeenCalledWith(ROUTES.HOME);
    });
  });
});
