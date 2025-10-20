import { HttpClient } from '@/service/HttpClient';
import { getSession } from '@/lib/auth-client';

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
});
