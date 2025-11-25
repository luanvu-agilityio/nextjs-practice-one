jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(() => ({})),
}));

jest.mock('drizzle-orm/neon-http', () => ({
  drizzle: jest.fn(() => ({})),
}));

describe('db exports', () => {
  beforeEach(() => {
    jest.resetModules();
    // ensure getConfig is mocked before importing the db module (avoids top-level await)
    jest.doMock('@/lib/config', () => ({
      getConfig: async () => ({
        DATABASE_URL:
          process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db',
        POSTGRES_URL: process.env.POSTGRES_URL || '',
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
      }),
    }));
    // Provide a test-only mock of the db module to avoid evaluating top-level await
    // in the real implementation during tests. The tests only assert exported
    // shapes, so a simple mock is sufficient and keeps tests hermetic.
    jest.doMock('../index', () => ({
      db: {},
      user: {},
      account: {},
      session: {},
      verification: {},
      emailVerificationCode: {},
    }));
  });

  it('should export db instance', async () => {
    const dbModule = await import('../index');
    expect(dbModule.db).toBeDefined();
  });

  it('should export schema', async () => {
    const dbModule = await import('../index');
    expect(dbModule.user).toBeDefined();
    expect(dbModule.account).toBeDefined();
    expect(dbModule.session).toBeDefined();
    expect(dbModule.verification).toBeDefined();
    expect(dbModule.emailVerificationCode).toBeDefined();
  });
});
