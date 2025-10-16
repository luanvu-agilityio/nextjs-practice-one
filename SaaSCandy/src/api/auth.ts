import { http } from '@/service';
import { UpdateUserData, User } from '@/types/user';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

const USERS_ENDPOINT = 'users';

export const authApi = {
  // NOT used for actual authentication - only for MockAPI sync
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const users = await http.get<User[]>(
        `${USERS_ENDPOINT}?email=${encodeURIComponent(payload.email)}&password=${encodeURIComponent(payload.password)}`
      );

      const user = Array.isArray(users) ? users[0] : undefined;
      if (!user) {
        throw new Error('Invalid credentials');
      }

      return {
        token: `mock-token-${Date.now()}-${user.id}`,
        user,
      };
    } catch (error) {
      console.error('Login API error:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  },

  // Sync new users to MockAPI
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      const userData = {
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        name:
          `${payload.firstName || ''} ${payload.lastName || ''}`.trim() ||
          payload.email,
        email: payload.email,
        password: payload.password,
        photo: null,
        createdAt: new Date().toISOString(),
      };

      const user = await http.post<User>(USERS_ENDPOINT, userData);

      return {
        token: `mock-token-${Date.now()}-${user.id}`,
        user,
      };
    } catch (error) {
      console.error('Registration API error:', error);
      throw new Error('Registration failed. Please try again.');
    }
  },

  // Find user by email
  findByEmail: async (email: string): Promise<User | null> => {
    try {
      const users = await http.get<User[]>(
        `${USERS_ENDPOINT}?email=${encodeURIComponent(email)}`
      );
      return Array.isArray(users) && users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Find user by email error:', error);
      return null;
    }
  },

  getUser: async (id: string): Promise<User> => {
    try {
      return await http.get<User>(`${USERS_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Get user API error:', error);
      throw new Error('Failed to fetch user data.');
    }
  },

  updateUser: async (id: string, patch: UpdateUserData): Promise<User> => {
    try {
      const updateData = { ...patch };
      if (patch.newPassword) {
        updateData.password = patch.newPassword;
        delete updateData.newPassword;
      }

      return await http.put<User>(`${USERS_ENDPOINT}/${id}`, updateData);
    } catch (error) {
      console.error('Update user API error:', error);
      throw new Error('Failed to update user data.');
    }
  },

  verifyPassword: async (
    id: string,
    currentPassword: string
  ): Promise<boolean> => {
    try {
      const user = await http.get<User>(`${USERS_ENDPOINT}/${id}`);
      return user.password === currentPassword;
    } catch (error) {
      console.error('Verify password API error:', error);
      throw new Error('Failed to verify password.');
    }
  },
};
