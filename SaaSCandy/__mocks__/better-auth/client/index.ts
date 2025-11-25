export const createAuthClient = jest.fn(() => ({
  useSession: jest.fn(() => ({
    data: null,
    isPending: false,
    isRefetching: false,
    error: null,
  })),
  signIn: { email: jest.fn() },
  signUp: { email: jest.fn() },
  signOut: jest.fn(),
}));
