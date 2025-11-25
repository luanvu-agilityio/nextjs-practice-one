import { authApi } from '../auth';
import { runHttpEffect } from '@/service/HttpClient/helper';
import { User } from '@/types/user';

jest.mock('@/service/HttpClient/helper', () => ({
  runHttpEffect: jest.fn(),
}));

const mockRunHttp = runHttpEffect as unknown as jest.MockedFunction<
  typeof runHttpEffect
>;

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
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    it('should return token and user on successful login', async () => {
      mockRunHttp.mockResolvedValue([mockUser]);
      const result = await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.user).toEqual(mockUser);
      expect(result.token).toContain('mock-token-');
      expect(mockRunHttp).toHaveBeenCalled();
    });

    it('should throw error when credentials are invalid', async () => {
      mockRunHttp.mockResolvedValue([]);
      await expect(
        authApi.login({ email: 'wrong@example.com', password: 'wrong' })
      ).rejects.toThrow('Login failed');
    });

    it('should throw error when http.get throws', async () => {
      mockRunHttp.mockRejectedValue(new Error('Network error'));
      await expect(
        authApi.login({ email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow('Login failed');
    });

    it('treats non-array response as invalid credentials', async () => {
      // If http.get returns a non-array (object), login should fail
      mockRunHttp.mockResolvedValue({} as unknown as User[]);
      await expect(
        authApi.login({ email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow('Login failed');
    });
  });

  describe('register', () => {
    it('should create new user and return token', async () => {
      mockRunHttp.mockResolvedValue(mockUser);
      const result = await authApi.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.user).toEqual(mockUser);
      expect(result.token).toContain('mock-token-');
      expect(mockRunHttp).toHaveBeenCalled();
    });

    it('should throw error when http.post throws', async () => {
      mockRunHttp.mockRejectedValue(new Error('Network error'));
      await expect(
        authApi.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Registration failed');
    });

    it('falls back to email as name when first/last missing', async () => {
      const created = { ...mockUser, name: mockUser.email };
      mockRunHttp.mockResolvedValue(created);

      const result = await authApi.register({
        email: mockUser.email,
        password: 'password123',
      });

      expect(result.user.name).toBe(mockUser.email);
      expect(result.token).toContain('mock-token-');
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      mockRunHttp.mockResolvedValue([mockUser]);
      const result = await authApi.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockRunHttp.mockResolvedValue([]);
      const result = await authApi.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });

    it('should return null when http.get throws', async () => {
      mockRunHttp.mockRejectedValue(new Error('Network error'));
      const result = await authApi.findByEmail('test@example.com');
      expect(result).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      mockRunHttp.mockResolvedValue(mockUser);
      const result = await authApi.getUser('1');
      expect(result).toEqual(mockUser);
      expect(mockRunHttp).toHaveBeenCalled();
    });

    it('should throw error when http.get throws', async () => {
      mockRunHttp.mockRejectedValue(new Error('Network error'));
      await expect(authApi.getUser('1')).rejects.toThrow(
        'Failed to fetch user data.'
      );
    });
  });

  describe('updateUser', () => {
    it('should update user with new password', async () => {
      const updatedUser = { ...mockUser, password: 'newpass123' };
      mockRunHttp.mockResolvedValue(updatedUser);
      const result = await authApi.updateUser('1', {
        newPassword: 'newpass123',
      });
      expect(result.password).toBe('newpass123');
      expect(mockRunHttp).toHaveBeenCalled();
    });

    it('should update user with patch only', async () => {
      const updatedUser = { ...mockUser, firstName: 'Jane' };
      mockRunHttp.mockResolvedValue(updatedUser);
      const result = await authApi.updateUser('1', { firstName: 'Jane' });
      expect(result.firstName).toBe('Jane');
      expect(mockRunHttp).toHaveBeenCalled();
    });

    it('should throw error when http.put throws', async () => {
      mockRunHttp.mockRejectedValue(new Error('Network error'));
      await expect(
        authApi.updateUser('1', { firstName: 'Jane' })
      ).rejects.toThrow('Failed to update user data.');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      mockRunHttp.mockResolvedValue(mockUser);
      const result = await authApi.verifyPassword('1', 'password123');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      mockRunHttp.mockResolvedValue(mockUser);
      const result = await authApi.verifyPassword('1', 'wrongpassword');
      expect(result).toBe(false);
    });

    it('should throw error when http.get throws', async () => {
      mockRunHttp.mockRejectedValue(new Error('Network error'));
      await expect(authApi.verifyPassword('1', 'password123')).rejects.toThrow(
        'Failed to verify password.'
      );
    });
  });
});
