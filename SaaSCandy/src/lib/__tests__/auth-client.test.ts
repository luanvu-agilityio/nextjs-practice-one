// Use Jest globals in these tests (do not import Vitest)

jest.doMock('better-auth/react', () => ({ createAuthClient }));
jest.doMock('better-auth/client/plugins', () => ({
  twoFactorClient: () => 'twoFactor',
}));

const createAuthClient = jest.fn(() => ({
  signIn: {},
  signUp: {},
  signOut: {},
  useSession: () => ({}),
  getSession: () => ({}),
  updateUser: () => ({}),
  twoFactor: { enable: () => {}, disable: () => {}, verifyOtp: () => {} },
}));

describe('auth-client', () => {
  let mockTwoFactorClient: jest.Mock;
  let mockSignIn: jest.Mock;
  let mockSignUp: jest.Mock;
  let mockSignOut: jest.Mock;
  let mockUseSession: jest.Mock;
  let mockGetSession: jest.Mock;
  let mockUpdateUser: jest.Mock;
  let mockEnableTwoFactor: jest.Mock;
  let mockDisableTwoFactor: jest.Mock;
  let mockVerifyOtp: jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset modules to ensure clean state
    jest.resetModules();

    // Create mock functions
    mockSignIn = jest.fn();
    mockSignUp = jest.fn();
    mockSignOut = jest.fn();
    mockUseSession = jest.fn();
    mockGetSession = jest.fn();
    mockUpdateUser = jest.fn();
    mockEnableTwoFactor = jest.fn();
    mockDisableTwoFactor = jest.fn();
    mockVerifyOtp = jest.fn();

    // Configure the top-level createAuthClient mock to return our mock functions
    createAuthClient.mockImplementation(() => ({
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: mockSignOut,
      useSession: mockUseSession,
      getSession: mockGetSession,
      updateUser: mockUpdateUser,
      twoFactor: {
        enable: mockEnableTwoFactor,
        disable: mockDisableTwoFactor,
        verifyOtp: mockVerifyOtp,
      },
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authClient initialization', () => {
    it('should create auth client with correct baseURL from environment variable', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';

      // Re-import to trigger initialization with new env
      await import('@/lib/auth-client');

      expect(createAuthClient).toHaveBeenCalledWith({
        baseURL: 'https://example.com',
        plugins: expect.any(Array),
      });

      process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    });

    it('should fallback to localhost when NEXT_PUBLIC_APP_URL is not set', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.NEXT_PUBLIC_APP_URL;

      jest.resetModules();
      await import('@/lib/auth-client');

      expect(createAuthClient).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        plugins: expect.any(Array),
      });

      process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    });

    it('should initialize with twoFactorClient plugin', async () => {
      await import('@/lib/auth-client');

      expect(createAuthClient).toHaveBeenCalledWith(
        expect.objectContaining({
          plugins: expect.arrayContaining([expect.anything()]),
        })
      );
    });
  });

  describe('exported functions', () => {
    it('should export signIn function', async () => {
      const { signIn } = await import('@/lib/auth-client');

      expect(signIn).toBeDefined();
      expect(typeof signIn).toBe('function');
      expect(signIn).toBe(mockSignIn);
    });

    it('should export signUp function', async () => {
      const { signUp } = await import('@/lib/auth-client');

      expect(signUp).toBeDefined();
      expect(typeof signUp).toBe('function');
      expect(signUp).toBe(mockSignUp);
    });

    it('should export signOut function', async () => {
      const { signOut } = await import('@/lib/auth-client');

      expect(signOut).toBeDefined();
      expect(typeof signOut).toBe('function');
      expect(signOut).toBe(mockSignOut);
    });

    it('should export useSession hook', async () => {
      const { useSession } = await import('@/lib/auth-client');

      expect(useSession).toBeDefined();
      expect(typeof useSession).toBe('function');
      expect(useSession).toBe(mockUseSession);
    });

    it('should export getSession function', async () => {
      const { getSession } = await import('@/lib/auth-client');

      expect(getSession).toBeDefined();
      expect(typeof getSession).toBe('function');
      expect(getSession).toBe(mockGetSession);
    });

    it('should export updateUser function', async () => {
      const { updateUser } = await import('@/lib/auth-client');

      expect(updateUser).toBeDefined();
      expect(typeof updateUser).toBe('function');
      expect(updateUser).toBe(mockUpdateUser);
    });
  });

  describe('two-factor authentication functions', () => {
    it('should export enableTwoFactor function', async () => {
      const { enableTwoFactor } = await import('@/lib/auth-client');

      expect(enableTwoFactor).toBeDefined();
      expect(typeof enableTwoFactor).toBe('function');
      expect(enableTwoFactor).toBe(mockEnableTwoFactor);
    });

    it('should export disableTwoFactor function', async () => {
      const { disableTwoFactor } = await import('@/lib/auth-client');

      expect(disableTwoFactor).toBeDefined();
      expect(typeof disableTwoFactor).toBe('function');
      expect(disableTwoFactor).toBe(mockDisableTwoFactor);
    });

    it('should export verifyOtp function', async () => {
      const { verifyOtp } = await import('@/lib/auth-client');

      expect(verifyOtp).toBeDefined();
      expect(typeof verifyOtp).toBe('function');
      expect(verifyOtp).toBe(mockVerifyOtp);
    });
  });

  describe('authClient object', () => {
    it('should export authClient with all methods', async () => {
      const { authClient } = await import('@/lib/auth-client');

      expect(authClient).toBeDefined();
      expect(authClient.signIn).toBe(mockSignIn);
      expect(authClient.signUp).toBe(mockSignUp);
      expect(authClient.signOut).toBe(mockSignOut);
      expect(authClient.useSession).toBe(mockUseSession);
      expect(authClient.getSession).toBe(mockGetSession);
      expect(authClient.updateUser).toBe(mockUpdateUser);
      expect(authClient.twoFactor.enable).toBe(mockEnableTwoFactor);
      expect(authClient.twoFactor.disable).toBe(mockDisableTwoFactor);
      expect(authClient.twoFactor.verifyOtp).toBe(mockVerifyOtp);
    });
  });

  describe('function behavior', () => {
    it('should call signOut without arguments', async () => {
      const { signOut } = await import('@/lib/auth-client');

      mockSignOut.mockResolvedValue({ success: true });
      await signOut();

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should call updateUser with user data', async () => {
      const { updateUser } = await import('@/lib/auth-client');
      const userData = { name: 'John Doe', email: 'john@example.com' };

      mockUpdateUser.mockResolvedValue({ success: true, user: userData });
      await updateUser(userData);

      expect(mockUpdateUser).toHaveBeenCalledWith(userData);
    });

    it('should call enableTwoFactor with password', async () => {
      const { enableTwoFactor } = await import('@/lib/auth-client');
      const password = 'securePassword123';

      mockEnableTwoFactor.mockResolvedValue({
        success: true,
        totpURI: 'otpauth://totp/Example:user@example.com',
      });
      await enableTwoFactor({ password });

      expect(mockEnableTwoFactor).toHaveBeenCalledWith({ password });
    });

    it('should call verifyOtp with code', async () => {
      const { verifyOtp } = await import('@/lib/auth-client');
      const code = '123456';

      mockVerifyOtp.mockResolvedValue({ success: true });
      await verifyOtp({ code });

      expect(mockVerifyOtp).toHaveBeenCalledWith({ code });
    });
  });
});
