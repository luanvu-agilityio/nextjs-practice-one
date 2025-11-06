/* eslint-disable @typescript-eslint/consistent-type-imports */
describe('better-auth social providers branch', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('enables social providers when env vars are present', async () => {
    process.env.SENDGRID_API_KEY = 'X';
    process.env.BETTER_AUTH_SECRET = 'S';
    process.env.GOOGLE_CLIENT_ID = 'google-id';
    process.env.GITHUB_ID = 'github-id';

    jest.doMock('@sendgrid/mail', () => ({
      setApiKey: jest.fn(),
      send: jest.fn(),
    }));
    const betterAuthMock = jest.fn((opts: unknown) => ({
      $Infer: { Session: {} },
    }));
    jest.doMock('better-auth', () => ({ betterAuth: betterAuthMock }));
    jest.doMock('better-auth/adapters/drizzle', () => ({
      drizzleAdapter: jest.fn(() => 'adapter'),
    }));
    jest.doMock('better-auth/plugins', () => ({
      twoFactor: jest.fn(() => ({})),
    }));
    jest.doMock('../db', () => ({ db: {} }));
    jest.doMock('@/constants/email-template', () => ({
      PasswordChangedAlertEmail: jest.fn(() => '<html/>'),
      ResetPasswordEmail: jest.fn(() => '<html/>'),
      VerificationEmail: jest.fn(() => '<html/>'),
    }));

    const mod = await import('../better-auth');

    // Inspect the options passed into betterAuth
    const opts = (betterAuthMock as jest.Mock).mock.calls[0][0] as unknown as {
      socialProviders: {
        google: { enabled: boolean };
        github: { enabled: boolean };
      };
    };
    expect(opts.socialProviders.google.enabled).toBe(true);
    expect(opts.socialProviders.github.enabled).toBe(true);
    expect(typeof mod.auth).toBe('object');
  });
});
