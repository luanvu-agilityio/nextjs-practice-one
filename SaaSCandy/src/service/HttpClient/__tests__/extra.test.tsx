import { HttpClient, http, isBrowser } from '../index';

describe('HttpClient - extra branches', () => {
  const origFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = origFetch;
    jest.restoreAllMocks();
  });

  it('buildUrl returns full url when path starts with http', async () => {
    const spy = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    globalThis.fetch = spy as unknown as typeof globalThis.fetch;

    await http.get('http://example.com/test');

    expect(spy).toHaveBeenCalled();
    const calledUrl = (spy.mock.calls[0] as unknown[])[0] as string;
    expect(calledUrl).toBe('http://example.com/test');
  });

  it('does not add Authorization header on server (typeof window === "undefined")', async () => {
    const spy = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    });
    globalThis.fetch = spy as unknown as typeof globalThis.fetch;

    await http.get('/foo');

    const calledInit = (spy.mock.calls[0] as unknown[])[1] as RequestInit;
    const headers = calledInit.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('HttpClient.buildUrl on instance respects absolute url (instance method)', () => {
    const client = new HttpClient('https://api.example.com/');
    // access private for testing via typed cast
    const built = (
      client as unknown as { buildUrl(path: string): string }
    ).buildUrl('http://other.com/x');
    expect(built).toBe('http://other.com/x');
  });

  it('isBrowser returns false when window is undefined', () => {
    const originalFlag = (globalThis as unknown as Record<string, unknown>)
      .__TEST_IS_BROWSER__;
    try {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        false;
      expect(isBrowser()).toBe(false);
    } finally {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        originalFlag;
    }
  });

  it('isBrowser returns true when window exists', () => {
    const originalFlag = (
      globalThis as unknown as { __TEST_IS_BROWSER__?: unknown }
    ).__TEST_IS_BROWSER__;
    try {
      (
        globalThis as unknown as { __TEST_IS_BROWSER__?: unknown }
      ).__TEST_IS_BROWSER__ = true;
      expect(isBrowser()).toBe(true);
    } finally {
      (
        globalThis as unknown as { __TEST_IS_BROWSER__?: unknown }
      ).__TEST_IS_BROWSER__ = originalFlag;
    }
  });

  it('adds Authorization header when session token exists', async () => {
    // ensure we run as browser for this test
    const originalFlag = (globalThis as unknown as Record<string, unknown>)
      .__TEST_IS_BROWSER__;
    (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
      true;

    // reset modules and mock the auth-client before importing the HttpClient
    jest.resetModules();
    jest.doMock('@/lib/auth-client', () => ({
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: { token: 'abc123' } } }),
    }));

    const spy = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    globalThis.fetch = spy as unknown as typeof globalThis.fetch;

    try {
      // import a fresh module instance so it picks up the mocked auth-client
      const mod = await import('../index');
      await mod.http.get('/secure');

      const calledInit = (spy.mock.calls[0] as unknown[])[1] as RequestInit;
      const headers = calledInit.headers as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer abc123');
    } finally {
      // restore original override and module registry so other tests are not affected
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        originalFlag;
      jest.resetModules();
    }
  });

  it('returns empty headers on server-side (fresh import)', async () => {
    // ensure we import a fresh module with no window defined
    jest.resetModules();
    const originalFlag = (globalThis as unknown as Record<string, unknown>)
      .__TEST_IS_BROWSER__;
    try {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        false;
      const mod = await import('../index');
      const headers = await (
        mod.http as unknown as {
          getAuthHeader(): Promise<Record<string, string>>;
        }
      ).getAuthHeader();
      expect(headers).toEqual({});
    } finally {
      // restore original override and clear module registry
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        originalFlag;
      jest.resetModules();
    }
  });

  it('handles response.json() rejection and returns null', async () => {
    const originalFlag = (globalThis as unknown as Record<string, unknown>)
      .__TEST_IS_BROWSER__;
    try {
      // run as server to avoid touching auth-client
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        false;

      const spy = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('invalid json')),
      });
      globalThis.fetch = spy as unknown as typeof globalThis.fetch;

      const res = await http.get('/will-json-fail');
      // json() rejects, our .catch(() => null) should make data === null
      expect(res).toBeNull();
    } finally {
      (globalThis as unknown as Record<string, unknown>).__TEST_IS_BROWSER__ =
        originalFlag;
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
