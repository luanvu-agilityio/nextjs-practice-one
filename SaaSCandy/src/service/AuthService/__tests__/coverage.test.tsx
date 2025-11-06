import {
  apiRequest,
  send2FACode,
  verify2FACode,
  changePassword,
  updateProfile,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from '../index';

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
    const res1 = await send2FACode('a@b.com', 'p');
    expect(res1.success).toBe(false);
  });

  it('exports and helper flows: requestPasswordReset and resetPassword', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    } as unknown as Response);

    const ok = await requestPasswordReset('a@b.com');
    expect(ok.success).toBe(true);

    // resetPassword with nullish token should send empty token
    let body: string | undefined;
    globalThis.fetch = jest.fn().mockImplementation(async (_url, init) => {
      body = (init as RequestInit).body as string;
      return {
        ok: true,
        json: async () => ({ data: {} }),
      } as unknown as Response;
    });
    await resetPassword(null as unknown as string, 'np');
    expect(body).toBeDefined();
    const parsed = JSON.parse(body as string);
    expect(parsed.token).toBe('');
  });

  it('verifyEmail calls with token query', async () => {
    let url = '';
    globalThis.fetch = jest.fn().mockImplementation(async u => {
      url = String(u);
      return {
        ok: true,
        json: async () => ({ data: {} }),
      } as unknown as Response;
    });
    await verifyEmail('tok-1');
    expect(url).toContain('?token=tok-1');
  });

  it('changePassword/updateProfile call through', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    } as unknown as Response);

    const ch = await changePassword('a', 'b');
    expect(ch.success).toBe(true);

    const up = await updateProfile({ name: 'x' });
    expect(up.success).toBe(true);
  });
});
