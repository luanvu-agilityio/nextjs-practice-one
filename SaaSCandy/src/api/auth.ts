import { http } from '@/service';
import { runHttpEffect } from '@/service/HttpClient/helper';
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

/**
 * authApi provides methods for user authentication and user management via MockAPI.
 * Includes login, registration, user lookup, update, and password verification.
 */
export const authApi = {
  /**
   * Authenticates a user by email and password.
   * NOT used for actual authentication - only for MockAPI sync.
   * @param payload - Login credentials.
   * @returns AuthResponse with token and user data.
   * @throws {Error} If credentials are invalid or request fails.
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const users = await runHttpEffect<User[]>(
        http.get<User[]>(
          `${USERS_ENDPOINT}?email=${encodeURIComponent(payload.email)}&password=${encodeURIComponent(payload.password)}`
        )
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

  /**
   * Registers a new user and syncs to MockAPI.
   * @param payload - Registration data.
   * @returns AuthResponse with token and user data.
   * @throws {Error} If registration fails.
   */
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

      const user = await runHttpEffect<User>(
        http.post<User>(USERS_ENDPOINT, userData)
      );

      return {
        token: `mock-token-${Date.now()}-${user.id}`,
        user,
      };
    } catch (error) {
      console.error('Registration API error:', error);
      throw new Error('Registration failed. Please try again.');
    }
  },

  /**
   * Finds a user by email.
   * @param email - The user's email address.
   * @returns The User object if found, otherwise null.
   */
  findByEmail: async (email: string): Promise<User | null> => {
    try {
      const users = await runHttpEffect<User[]>(
        http.get<User[]>(`${USERS_ENDPOINT}?email=${encodeURIComponent(email)}`)
      );
      return Array.isArray(users) && users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Find user by email error:', error);
      return null;
    }
  },

  /**
   * Fetches a user by ID.
   * @param id - The user's unique ID.
   * @returns The User object.
   * @throws {Error} If fetching fails.
   */
  getUser: async (id: string): Promise<User> => {
    try {
      return await runHttpEffect<User>(
        http.get<User>(`${USERS_ENDPOINT}/${id}`)
      );
    } catch (error) {
      console.error('Get user API error:', error);
      throw new Error('Failed to fetch user data.');
    }
  },

  /**
   * Updates a user's data.
   * @param id - The user's unique ID.
   * @param patch - Partial user data to update.
   * @returns The updated User object.
   * @throws {Error} If update fails.
   */
  updateUser: async (id: string, patch: UpdateUserData): Promise<User> => {
    try {
      const updateData = { ...patch };
      if (patch.newPassword) {
        updateData.password = patch.newPassword;
        delete updateData.newPassword;
      }

      return await runHttpEffect<User>(
        http.put<User>(`${USERS_ENDPOINT}/${id}`, updateData)
      );
    } catch (error) {
      console.error('Update user API error:', error);
      throw new Error('Failed to update user data.');
    }
  },

  /**
   * Verifies a user's current password.
   * @param id - The user's unique ID.
   * @param currentPassword - The current password to verify.
   * @returns True if the password matches, false otherwise.
   * @throws {Error} If verification fails.
   */
  verifyPassword: async (
    id: string,
    currentPassword: string
  ): Promise<boolean> => {
    try {
      const user = await runHttpEffect<User>(
        http.get<User>(`${USERS_ENDPOINT}/${id}`)
      );
      return user.password === currentPassword;
    } catch (error) {
      console.error('Verify password API error:', error);
      throw new Error('Failed to verify password.');
    }
  },
};
