import { HttpClient, http } from '../index';
import { Effect } from 'effect';

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

    await Effect.runPromise(http.get('http://example.com/test'));

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

    await Effect.runPromise(http.get('/foo'));

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

  it('adds Authorization header when session token exists', async () => {
    // ensure we run as browser for this test
    const originalWindow = (globalThis as unknown as { window?: unknown })
      .window;
    (globalThis as unknown as { window?: unknown }).window = {};

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
      await Effect.runPromise(mod.http.get('/secure'));

      const calledInit = (spy.mock.calls[0] as unknown[])[1] as RequestInit;
      const headers = calledInit.headers as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer abc123');
    } finally {
      // restore original window and module registry so other tests are not affected
      (globalThis as unknown as { window?: unknown }).window = originalWindow;
      jest.resetModules();
    }
  });

  it('returns empty headers on server-side (fresh import)', async () => {
    // ensure we import a fresh module with no window defined
    jest.resetModules();
    // ensure any previous auth-client mock doesn't leak in; explicitly mock
    // auth-client to return no session for this fresh-import test
    jest.doMock('@/lib/auth-client', () => ({
      getSession: jest.fn().mockResolvedValue({ data: null }),
    }));
    const originalWindow = (globalThis as unknown as { window?: unknown })
      .window;
    try {
      (globalThis as unknown as { window?: unknown }).window = undefined;
      const mod = await import('../index');
      const headers = await Effect.runPromise(
        (
          mod.http as unknown as {
            getAuthHeader(): Effect.Effect<
              Record<string, string>,
              never,
              never
            >;
          }
        ).getAuthHeader()
      );
      expect(headers).toEqual({});
    } finally {
      // restore original window and clear module registry
      (globalThis as unknown as { window?: unknown }).window = originalWindow;
      jest.resetModules();
    }
  });

  it('handles response.json() rejection and returns null', async () => {
    const originalWindow = (globalThis as unknown as { window?: unknown })
      .window;
    try {
      // run as server to avoid touching auth-client
      (globalThis as unknown as { window?: unknown }).window = undefined;

      const spy = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('invalid json')),
      });
      globalThis.fetch = spy as unknown as typeof globalThis.fetch;

      const res = await Effect.runPromise(http.get('/will-json-fail'));
      // json() rejects, our .catch(() => null) should make data === null
      expect(res).toBeNull();
    } finally {
      (globalThis as unknown as { window?: unknown }).window = originalWindow;
    }
  });

  // Removed direct tests of `isBrowser` helper; behavior is now exercised
  // indirectly via getAuthHeader and module import tests above.

  it('http default instance works for absolute url', async () => {
    const spy = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    globalThis.fetch = spy as unknown as typeof globalThis.fetch;
    await Effect.runPromise(http.get('http://x/y'));
    expect(spy).toHaveBeenCalled();
  });
});
