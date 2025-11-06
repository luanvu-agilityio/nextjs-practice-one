import { HttpClient } from '@/service/HttpClient';
import { getSession } from '@/lib/auth-client';
import { http } from '../index';

jest.mock('@/lib/auth-client', () => ({
  getSession: jest.fn(),
}));

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new HttpClient('https://api.example.com');
    mockGetSession.mockResolvedValue({ data: null });
  });

  describe('get', () => {
    it('should make GET request successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', name: 'Test' }),
      } as Response);

      const result = await client.get<{ id: string; name: string }>('users/1');

      expect(result).toEqual({ id: '1', name: 'Test' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('post', () => {
    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', name: 'John' }),
      } as Response);

      const result = await client.post('users', { name: 'John' });

      expect(result).toEqual({ id: '1', name: 'John' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'John' }),
        })
      );
    });
  });

  describe('put', () => {
    it('should make PUT request with body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', name: 'Updated' }),
      } as Response);

      const result = await client.put('users/1', { name: 'Updated' });

      expect(result).toEqual({ id: '1', name: 'Updated' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('delete', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await client.delete('users/1');

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('error handling', () => {
    it('should throw error on failed request', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'User not found' }),
      } as Response);

      await expect(client.get('users/999')).rejects.toThrow('User not found');
    });
  });

  describe('authentication', () => {
    it('should include auth header when session exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { token: 'test-token' } },
      } as ReturnType<typeof getSession>);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response);

      await client.get('protected');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('internal methods and edge cases', () => {
    it('should build full URL if path is already a full URL', () => {
      const url = (
        client as unknown as { buildUrl(path: string): string }
      ).buildUrl('https://other.com/api');
      expect(url).toBe('https://other.com/api');
    });

    it('should build full URL from base and relative path', () => {
      const url = (
        client as unknown as { buildUrl(path: string): string }
      ).buildUrl('/users/1');
      expect(url).toBe('https://api.example.com/users/1');
    });

    it('should not include auth header on server-side', async () => {
      const originalWindow = (globalThis as { window?: Window }).window;
      try {
        // simulate server-side by removing window
        // some environments have a non-configurable window; set to undefined instead
        (globalThis as { window?: Window }).window = undefined;
        const headers = await (
          client as unknown as {
            getAuthHeader(): Promise<Record<string, string>>;
          }
        ).getAuthHeader();
        expect(headers).toEqual({});
      } finally {
        (globalThis as { window?: Window }).window = originalWindow;
      }
    });

    it('should set error status and data on failed request', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error', details: 'fail' }),
      } as Response);
      try {
        await client.get('fail');
      } catch (err: unknown) {
        const e = err as Error & { status?: number; data?: unknown };
        expect(e).toBeInstanceOf(Error);
        expect(e.status).toBe(500);
        expect(e.data).toEqual({ message: 'Server error', details: 'fail' });
      }
    });
    it('uses statusText when response.json returns null', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Bad',
        json: async () => null,
      } as Response);

      await expect(client.get('boom')).rejects.toThrow('Server Bad');
    });
    it('should export default http client', async () => {
      expect(http).toBeInstanceOf(HttpClient);
    });
  });
  it('should handle fetch throwing error in request', async () => {
    (
      globalThis.fetch as jest.MockedFunction<typeof fetch>
    ).mockImplementationOnce(() => {
      throw new Error('Network error');
    });
    await expect(client.get('fail')).rejects.toThrow('Network error');
  });

  it('should handle fetch throwing non-Error in request', async () => {
    (
      globalThis.fetch as jest.MockedFunction<typeof fetch>
    ).mockImplementationOnce(() => {
      throw 'fail';
    });
    try {
      await client.get('fail');
    } catch (err: unknown) {
      // Should not expect Error instance, just check value and message
      expect(err).toBe('fail');
    }
  });

  it('should trim trailing slashes from baseUrl in constructor', () => {
    const c = new HttpClient('https://api.example.com////');
    expect(c.baseUrl).toBe('https://api.example.com');
  });

  it('should handle response.json returning null', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => null,
    } as Response);
    const result = await client.get('users/empty');
    expect(result).toBeNull();
  });
});
