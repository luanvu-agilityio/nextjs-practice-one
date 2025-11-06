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
});
