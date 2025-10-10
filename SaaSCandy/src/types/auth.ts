import { User } from './user';
export type AuthState =
  | {
      success: boolean;
      user: User;
      credentials: {
        email: string;
        password: string;
      };
      error: undefined;
    }
  | {
      error: unknown;
      success: undefined;
      user: undefined;
      credentials: undefined;
    };
