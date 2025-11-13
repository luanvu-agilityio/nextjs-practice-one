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
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

    it('should throw error when http.get throws', async () => {
      mockHttp.get.mockRejectedValue(new Error('Network error'));
      await expect(
        authApi.login({ email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow('Login failed');
    });

    it('treats non-array response as invalid credentials', async () => {
      // If http.get returns a non-array (object), login should fail
      mockHttp.get.mockResolvedValue({} as unknown as User[]);
      await expect(
        authApi.login({ email: 'test@example.com', password: 'password123' })
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

    it('should throw error when http.post throws', async () => {
      mockHttp.post.mockRejectedValue(new Error('Network error'));
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
      mockHttp.post.mockResolvedValue(created);

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
      mockHttp.get.mockResolvedValue([mockUser]);
      const result = await authApi.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockHttp.get.mockResolvedValue([]);
      const result = await authApi.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });

    it('should return null when http.get throws', async () => {
      mockHttp.get.mockRejectedValue(new Error('Network error'));
      const result = await authApi.findByEmail('test@example.com');
      expect(result).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      mockHttp.get.mockResolvedValue(mockUser);
      const result = await authApi.getUser('1');
      expect(result).toEqual(mockUser);
      expect(mockHttp.get).toHaveBeenCalledWith('users/1');
    });

    it('should throw error when http.get throws', async () => {
      mockHttp.get.mockRejectedValue(new Error('Network error'));
      await expect(authApi.getUser('1')).rejects.toThrow(
        'Failed to fetch user data.'
      );
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

    it('should update user with patch only', async () => {
      const updatedUser = { ...mockUser, firstName: 'Jane' };
      mockHttp.put.mockResolvedValue(updatedUser);
      const result = await authApi.updateUser('1', { firstName: 'Jane' });
      expect(result.firstName).toBe('Jane');
      expect(mockHttp.put).toHaveBeenCalledWith(
        'users/1',
        expect.objectContaining({ firstName: 'Jane' })
      );
    });

    it('should throw error when http.put throws', async () => {
      mockHttp.put.mockRejectedValue(new Error('Network error'));
      await expect(
        authApi.updateUser('1', { firstName: 'Jane' })
      ).rejects.toThrow('Failed to update user data.');
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

    it('should throw error when http.get throws', async () => {
      mockHttp.get.mockRejectedValue(new Error('Network error'));
      await expect(authApi.verifyPassword('1', 'password123')).rejects.toThrow(
        'Failed to verify password.'
      );
    });
  });
});
