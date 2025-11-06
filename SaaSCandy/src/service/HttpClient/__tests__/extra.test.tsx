import { HttpClient, http } from '../index';

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
});
