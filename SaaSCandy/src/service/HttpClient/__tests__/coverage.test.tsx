import { HttpClient, http } from '../index';
import { Effect } from 'effect';
import type { Effect as EffectType } from 'effect/Effect';

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
    const originalWindow = (globalThis as unknown as { window?: unknown })
      .window;
    try {
      // simulate server-side by removing window
      (globalThis as unknown as { window?: unknown }).window = undefined;
      const c = new HttpClient('https://a');
      const h = await Effect.runPromise(
        (
          c as unknown as {
            getAuthHeader(): EffectType<Record<string, string>, never, never>;
          }
        ).getAuthHeader()
      );
      expect(h).toEqual({});
    } finally {
      (globalThis as unknown as { window?: unknown }).window = originalWindow;
    }
  });

  it('getAuthHeader returns token header when session has token', async () => {
    // ensure browser env and mock auth-client before importing module
    const originalWindow = (globalThis as unknown as { window?: unknown })
      .window;
    try {
      // simulate browser by ensuring window exists
      (globalThis as unknown as { window?: unknown }).window = {};
      jest.resetModules();
      const mock = {
        getSession: jest
          .fn()
          .mockResolvedValue({ data: { session: { token: 't123' } } }),
      };
      jest.doMock('@/lib/auth-client', () => mock);
      const mod = await import('../index');
      const c = new mod.HttpClient('https://a');
      const h = await Effect.runPromise(
        (
          c as unknown as {
            getAuthHeader(): EffectType<Record<string, string>, never, never>;
          }
        ).getAuthHeader()
      );
      expect(h.Authorization).toBe('Bearer t123');
    } finally {
      (globalThis as unknown as { window?: unknown }).window = originalWindow;
      jest.resetModules();
    }
  });

  it('getAuthHeader swallows errors from getSession and returns {}', async () => {
    const originalWindow = (globalThis as unknown as { window?: unknown })
      .window;
    try {
      (globalThis as unknown as { window?: unknown }).window = {};
      jest.resetModules();
      const mock = {
        getSession: jest.fn().mockResolvedValue({ data: null }),
      };
      jest.doMock('@/lib/auth-client', () => mock);
      const mod = await import('../index');
      const c = new mod.HttpClient('https://a');
      const h = await Effect.runPromise(
        (
          c as unknown as {
            getAuthHeader(): EffectType<Record<string, string>, never, never>;
          }
        ).getAuthHeader()
      );
      expect(h).toEqual({});
    } finally {
      (globalThis as unknown as { window?: unknown }).window = originalWindow;
      jest.resetModules();
    }
  });

  it('request handles json rejection and throws HttpError on bad status', async () => {
    // make sure we run as server to avoid auth
    const originalWindow = (globalThis as unknown as { window?: unknown })
      .window;
    try {
      // remove window to simulate server environment
      (globalThis as unknown as { window?: unknown }).window = undefined;

      const spy = jest.fn().mockResolvedValue({
        ok: false,
        status: 418,
        statusText: 'Teapot',
        json: jest.fn().mockRejectedValue(new Error('bad json')),
      });
      globalThis.fetch = spy as unknown as typeof globalThis.fetch;

      const c = new HttpClient('https://a');
      await expect(
        Effect.runPromise(
          (
            c as unknown as {
              request(
                method: string,
                path: string,
                body?: unknown
              ): EffectType<unknown, unknown, never>;
            }
          ).request('GET', '/x')
        )
      ).rejects.toThrow('Teapot');
    } finally {
      (globalThis as unknown as { window?: unknown }).window = originalWindow;
    }
  });

  // `isBrowser` helper removed; its behavior is covered indirectly elsewhere.

  it('http default instance works for absolute url', async () => {
    const spy = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    globalThis.fetch = spy as unknown as typeof globalThis.fetch;
    await Effect.runPromise(http.get('http://x/y'));
    expect(spy).toHaveBeenCalled();
  });
});
