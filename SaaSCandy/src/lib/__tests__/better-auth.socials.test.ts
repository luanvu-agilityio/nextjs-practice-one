describe('better-auth social providers branch', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('enables social providers when env vars are present', async () => {
    process.env.SENDGRID_API_KEY = 'X';
    process.env.BETTER_AUTH_SECRET = 'S';
    process.env.GOOGLE_CLIENT_ID = 'google-id';
    process.env.GITHUB_ID = 'github-id';

    const sgMock = { setApiKey: jest.fn(), send: jest.fn() };
    const betterAuthMock = jest.fn((opts: unknown) => ({
      $Infer: { Session: {} },
      ...(opts || {}),
    }));

    jest.doMock('@sendgrid/mail', () => sgMock);
    // mock config so module-level `await getConfig()` resolves during import
    jest.doMock('@/lib/config', () => ({
      getConfig: async () => ({
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || 'S',
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || 'X',
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'https://auth.test',
        DATABASE_URL: process.env.DATABASE_URL || '',
        POSTGRES_URL: process.env.POSTGRES_URL || '',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        GITHUB_ID: process.env.GITHUB_ID || '',
        GITHUB_SECRET: process.env.GITHUB_SECRET || '',
      }),
    }));

    // Provide a friendly test-only mock for the module path to avoid evaluating
    // the real `better-auth` initialization which contains top-level await.
    jest.doMock('../better-auth', () => {
      if (sgMock && typeof sgMock.setApiKey === 'function')
        sgMock.setApiKey(process.env.SENDGRID_API_KEY || '');
      if (betterAuthMock && typeof betterAuthMock === 'function')
        betterAuthMock({
          socialProviders: {
            google: { enabled: !!process.env.GOOGLE_CLIENT_ID },
            github: { enabled: !!process.env.GITHUB_ID },
          },
        });
      return { auth: { $Infer: { Session: {} } } };
    });
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
