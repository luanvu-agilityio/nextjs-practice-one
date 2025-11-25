import { send2FACode, resetPassword, verifyEmail } from '../index';
import { Effect } from 'effect';
import type { ApiResponse } from '../index';
import { AppError } from '@/lib/errors';
import { runAuthEffect } from '../helpers';

function run<T>(effect: Effect.Effect<T, unknown, unknown>): Promise<T> {
  return runAuthEffect(
    effect as unknown as Effect.Effect<unknown, AppError, unknown>
  ) as Promise<T>;
}

describe('AuthService - extra branches', () => {
  const origFetch = global.fetch;

  afterEach(() => {
    global.fetch = origFetch;
    jest.restoreAllMocks();
  });

  it('send2FACode returns error when server responds not ok with message', async () => {
    // Mock for retries (initial + 2 retries = 3 responses)
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'invalid' }),
      statusText: 'Bad',
    } as unknown as Response);

    // Use valid password (6+ chars) to pass validation and reach API level
    const res = (await run(send2FACode('a@a.com', 'password123'))) as
      | ApiResponse
      | undefined;
    expect(res && res.success).toBe(false);
    expect(res && res.error).toEqual(expect.stringContaining('invalid'));
  });

  it('resetPassword validates token and password', async () => {
    // Test that validation catches empty token
    const emptyTokenRes = (await run(
      resetPassword('', 'password123')
    )) as ApiResponse;
    expect(emptyTokenRes.success).toBe(false);
    expect(emptyTokenRes.error).toContain('Token is required');

    // Test that validation catches short password
    const shortPassRes = (await run(
      resetPassword('valid-token', 'short')
    )) as ApiResponse;
    expect(shortPassRes.success).toBe(false);
    expect(shortPassRes.error).toContain('at least 6 characters');
  });

  it('verifyEmail calls the API with token query param', async () => {
    let calledUrl = '';
    global.fetch = jest.fn().mockImplementation(async url => {
      calledUrl = String(url);
      return {
        ok: true,
        json: async () => ({ data: {} }),
      } as unknown as Response;
    });

    await run(verifyEmail('abc-token'));
    expect(calledUrl).toContain('?token=abc-token');
  });

  it('requestPasswordReset handles success and error responses', async () => {
    // success
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: {} }),
    } as unknown as Response);

    const okRes = (await run(
      (await import('../index')).requestPasswordReset('a@b.com')
    )) as ApiResponse | undefined;
    expect(okRes && okRes.success).toBe(true);

    // error with message fallback - need retries (initial + 2 retries = 3 mocks)
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'invalid email' }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'invalid email' }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'invalid email' }),
      } as unknown as Response);

    const errRes = (await run(
      (await import('../index')).requestPasswordReset('a@b.com')
    )) as ApiResponse | undefined;
    expect(errRes && errRes.success).toBe(false);
    expect(errRes && errRes.error).toEqual(
      expect.stringContaining('invalid email')
    );
  });

  it('apiRequest uses fallback "Request failed" when response has no message/error', async () => {
    // simulate a failing response with empty object body - need 3 mocks for retries
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    } as unknown as Response);

    // Use valid password to pass validation
    const res = (await run(
      (await import('../index')).send2FACode('x@x.com', 'password123')
    )) as ApiResponse | undefined;
    expect(res && res.success).toBe(false);
    expect(res && res.error).toEqual(expect.stringContaining('Request failed'));
  });

  it('apiRequest returns nested data.data when present', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { nested: true } }),
    } as unknown as Response);

    // Use valid password to pass validation
    const res = (await run(
      (await import('../index')).send2FACode('x@x.com', 'password123')
    )) as ApiResponse | undefined;
    expect(res && res.success).toBe(true);
    expect(res && res.data).toEqual({ nested: true });
  });

  it('apiRequest default options param is used when omitted', async () => {
    // call apiRequest directly without options to hit default param
    const mod = await import('../index');
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { ok: true } }),
    } as unknown as Response) as unknown as typeof globalThis.fetch;

    const res = await mod.apiRequest('http://example.com/test');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ ok: true });
  });
});
