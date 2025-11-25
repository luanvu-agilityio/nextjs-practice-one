export const createAuthClient = jest.fn(() => ({
  signIn: { email: jest.fn() },
  signUp: { email: jest.fn() },
  signOut: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    isPending: false,
    isRefetching: false,
    error: null,
  })),
  getSession: jest.fn(async () => ({ data: null })),
  updateUser: jest.fn(),
  twoFactor: {
    enable: jest.fn(),
    disable: jest.fn(),
    verifyOtp: jest.fn(),
  },
}));
