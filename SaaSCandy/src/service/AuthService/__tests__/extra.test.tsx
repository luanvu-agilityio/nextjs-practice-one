import { send2FACode, resetPassword, verifyEmail } from '../index';

describe('AuthService - extra branches', () => {
  const origFetch = global.fetch;

  afterEach(() => {
    global.fetch = origFetch;
    jest.restoreAllMocks();
  });

  it('send2FACode returns error when server responds not ok with message', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'invalid' }),
      statusText: 'Bad',
    } as unknown as Response);

    const res = await send2FACode('a@a.com', 'p');
    expect(res.success).toBe(false);
    expect(res.error).toBe('invalid');
  });

  it('resetPassword sends empty token when token is nullish', async () => {
    let calledBody: string | undefined;

    global.fetch = jest.fn().mockImplementation(async (_url, options) => {
      calledBody = (options as RequestInit).body as string;
      return {
        ok: true,
        json: async () => ({ data: {} }),
      } as unknown as Response;
    });

    await resetPassword(null as unknown as string, 'newpass');

    expect(calledBody).toBeDefined();
    const parsed = JSON.parse(calledBody as string);
    expect(parsed.token).toBe('');
    expect(parsed.newPassword).toBe('newpass');
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

    await verifyEmail('abc-token');
    expect(calledUrl).toContain('?token=abc-token');
  });

  it('requestPasswordReset handles success and error responses', async () => {
    // success
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: {} }),
    } as unknown as Response);

    const okRes = await (
      await import('../index')
    ).requestPasswordReset('a@b.com');
    expect(okRes.success).toBe(true);

    // error with message fallback
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'invalid email' }),
    } as unknown as Response);

    const errRes = await (
      await import('../index')
    ).requestPasswordReset('a@b.com');
    expect(errRes.success).toBe(false);
    expect(errRes.error).toBe('invalid email');
  });

  it('apiRequest uses fallback "Request failed" when response has no message/error', async () => {
    // simulate a failing response with empty object body
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({}),
    } as unknown as Response);

    const res = await (await import('../index')).send2FACode('x@x.com', 'p');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Request failed');
  });

  it('apiRequest returns nested data.data when present', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { nested: true } }),
    } as unknown as Response);

    const res = await (await import('../index')).send2FACode('x@x.com', 'p');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ nested: true });
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
