export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  photo?: string | null;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser extends User {
  token?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  password?: string;
  newPassword?: string;
  photo?: string | null;
}
