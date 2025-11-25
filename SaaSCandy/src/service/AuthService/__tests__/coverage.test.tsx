import { AppError } from '@/lib/errors';
import {
  apiRequest,
  send2FACode,
  changePassword,
  updateProfile,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from '../index';
import type { ApiResponse } from '../index';
import { Effect } from 'effect';
import { runAuthEffect } from '../helpers';

function run<T>(effect: Effect.Effect<T, unknown, unknown>): Promise<T> {
  return runAuthEffect(
    effect as unknown as Effect.Effect<unknown, AppError, unknown>
  ) as Promise<T>;
}

const originalFetch = globalThis.fetch;

describe('AuthService - coverage helpers', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('apiRequest: success with nested data and message', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { nested: true }, message: 'ok' }),
    } as unknown as Response);

    const res = await apiRequest('http://x');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ nested: true });
    expect(res.message).toBe('ok');
  });

  it('apiRequest: not ok prefers message over error when both present', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'bad', message: 'no' }),
    } as unknown as Response);

    const res = await apiRequest('http://x');
    expect(res.success).toBe(false);
    // apiRequest uses data.message || data.error
    expect(res.error).toBe('no');
  });

  it('apiRequest: not ok with empty body falls back to Request failed', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as unknown as Response);

    const res = await apiRequest('http://x');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Request failed');
  });

  it('apiRequest: fetch throws Error', async () => {
    (globalThis.fetch as jest.Mock) = jest.fn().mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const res1 = (await run(send2FACode('a@b.com', 'p'))) as
      | ApiResponse
      | undefined;
    expect(res1 && res1.success).toBe(false);
  });

  it('exports and helper flows: requestPasswordReset and resetPassword', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    } as unknown as Response);

    const ok = (await run(requestPasswordReset('a@b.com'))) as
      | ApiResponse
      | undefined;
    expect(ok && ok.success).toBe(true);

    // resetPassword validation prevents null token from reaching API
    const result = await run(
      resetPassword(null as unknown as string, 'password123')
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('Token is required');
  });

  it('verifyEmail calls with token query', async () => {
    let url = '';
    globalThis.fetch = jest.fn().mockImplementation(async u => {
      url = String(u);
      return {
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as unknown as Response;
    });
    await run(verifyEmail('tok-1'));
    expect(url).toContain('?token=tok-1');
  });

  it('changePassword/updateProfile call through', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    } as unknown as Response);

    // Use valid passwords (6+ chars, and different from each other)
    const ch = (await run(changePassword('password123', 'newpass456'))) as
      | ApiResponse
      | undefined;
    expect(ch && ch.success).toBe(true);

    const up = (await run(updateProfile({ name: 'x' }))) as
      | ApiResponse
      | undefined;
    expect(up && up.success).toBe(true);
  });
});
