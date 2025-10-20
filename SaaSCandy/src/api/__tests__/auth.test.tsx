import { authApi } from '../auth';
import { http } from '@/service';
import { User } from '@/types/user';

jest.mock('@/service');

const mockHttp = http as jest.Mocked<typeof http>;

describe('authApi', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    photo: null,
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user on successful login', async () => {
      mockHttp.get.mockResolvedValue([mockUser]);

      const result = await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toContain('mock-token-');
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining('users?email=')
      );
    });

    it('should throw error when credentials are invalid', async () => {
      mockHttp.get.mockResolvedValue([]);

      await expect(
        authApi.login({ email: 'wrong@example.com', password: 'wrong' })
      ).rejects.toThrow('Login failed');
    });
  });

  describe('register', () => {
    it('should create new user and return token', async () => {
      mockHttp.post.mockResolvedValue(mockUser);

      const result = await authApi.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toContain('mock-token-');
      expect(mockHttp.post).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({ email: 'test@example.com' })
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      mockHttp.get.mockResolvedValue([mockUser]);

      const result = await authApi.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockHttp.get.mockResolvedValue([]);

      const result = await authApi.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user with new password', async () => {
      const updatedUser = { ...mockUser, password: 'newpass123' };
      mockHttp.put.mockResolvedValue(updatedUser);

      const result = await authApi.updateUser('1', {
        newPassword: 'newpass123',
      });

      expect(result.password).toBe('newpass123');
      expect(mockHttp.put).toHaveBeenCalledWith(
        'users/1',
        expect.objectContaining({ password: 'newpass123' })
      );
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      mockHttp.get.mockResolvedValue(mockUser);

      const result = await authApi.verifyPassword('1', 'password123');

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      mockHttp.get.mockResolvedValue(mockUser);

      const result = await authApi.verifyPassword('1', 'wrongpassword');

      expect(result).toBe(false);
    });
  });
});
