import { HttpClient, isBrowser, http } from '../index';

const originalFetch = globalThis.fetch;

describe('HttpClient - coverage helpers', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('buildUrl respects absolute and relative', () => {
    const c = new HttpClient('https://api.example.com/');
    const abs = (c as unknown as { buildUrl(path: string): string }).buildUrl(
      'http://other/x'
    );
    expect(abs).toBe('http://other/x');
    const rel = (c as unknown as { buildUrl(path: string): string }).buildUrl(
      '/foo'
    );
    expect(rel).toBe('https://api.example.com/foo');
  });

  it('getAuthHeader returns {} when not browser', async () => {
    const orig = (globalThis as unknown as Record<string, unknown>)
      .__TEST_IS_BROWSER__;
    try {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        false;
      const c = new HttpClient('https://a');
      const h = await (
        c as unknown as { getAuthHeader(): Promise<Record<string, string>> }
      ).getAuthHeader();
      expect(h).toEqual({});
    } finally {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        orig;
    }
  });

  it('getAuthHeader returns token header when session has token', async () => {
    // ensure browser env and mock auth-client before importing module
    const orig = (globalThis as unknown as Record<string, unknown>)
      .__TEST_IS_BROWSER__;
    try {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        true;
      jest.resetModules();
      const mock = {
        getSession: jest
          .fn()
          .mockResolvedValue({ data: { session: { token: 't123' } } }),
      };
      jest.doMock('@/lib/auth-client', () => mock);
      const mod = await import('../index');
      const c = new mod.HttpClient('https://a');
      const h = await (
        c as unknown as { getAuthHeader(): Promise<Record<string, string>> }
      ).getAuthHeader();
      expect(h.Authorization).toBe('Bearer t123');
    } finally {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        orig;
      jest.resetModules();
    }
  });

  it('getAuthHeader swallows errors from getSession and returns {}', async () => {
    const orig = (globalThis as unknown as Record<string, unknown>)
      .__TEST_IS_BROWSER__;
    try {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        true;
      jest.resetModules();
      const mock = {
        getSession: jest.fn().mockImplementation(() => {
          throw new Error('session fail');
        }),
      };
      jest.doMock('@/lib/auth-client', () => mock);
      const mod = await import('../index');
      const c = new mod.HttpClient('https://a');
      const h = await (
        c as unknown as { getAuthHeader(): Promise<Record<string, string>> }
      ).getAuthHeader();
      expect(h).toEqual({});
    } finally {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        orig;
      jest.resetModules();
    }
  });

  it('request handles json rejection and throws HttpError on bad status', async () => {
    // make sure we run as server to avoid auth
    const orig = (globalThis as unknown as Record<string, unknown>)
      .__TEST_IS_BROWSER__;
    try {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        false;

      const spy = jest.fn().mockResolvedValue({
        ok: false,
        status: 418,
        statusText: 'Teapot',
        json: jest.fn().mockRejectedValue(new Error('bad json')),
      });
      globalThis.fetch = spy as unknown as typeof globalThis.fetch;

      const c = new HttpClient('https://a');
      await expect(
        (
          c as unknown as {
            request(method: string, path: string): Promise<unknown>;
          }
        ).request('GET', '/x')
      ).rejects.toThrow('Teapot');
    } finally {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        orig;
    }
  });

  it('isBrowser honors override flag', () => {
    const orig = (globalThis as unknown as { __TEST_IS_BROWSER__?: unknown })
      .__TEST_IS_BROWSER__;
    try {
      (
        globalThis as unknown as { __TEST_IS_BROWSER__?: unknown }
      ).__TEST_IS_BROWSER__ = true;
      expect(isBrowser()).toBe(true);
      (
        globalThis as unknown as { __TEST_IS_BROWSER__?: unknown }
      ).__TEST_IS_BROWSER__ = false;
      expect(isBrowser()).toBe(false);
    } finally {
      (
        globalThis as unknown as { __TEST_IS_BROWSER__?: unknown }
      ).__TEST_IS_BROWSER__ = orig;
    }
  });

  it('http default instance works for absolute url', async () => {
    const spy = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    globalThis.fetch = spy as unknown as typeof globalThis.fetch;
    await http.get('http://x/y');
    expect(spy).toHaveBeenCalled();
  });
});
