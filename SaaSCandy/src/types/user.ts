export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  photo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser extends User {
  token?: string;
}
