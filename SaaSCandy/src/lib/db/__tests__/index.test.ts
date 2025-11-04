import * as dbModule from '../index';

jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(() => ({})),
}));

jest.mock('drizzle-orm/neon-http', () => ({
  drizzle: jest.fn(() => ({})),
}));

describe('db exports', () => {
  it('should export db instance', () => {
    expect(dbModule.db).toBeDefined();
  });

  it('should export schema', () => {
    expect(dbModule.user).toBeDefined();
    expect(dbModule.account).toBeDefined();
    expect(dbModule.session).toBeDefined();
    expect(dbModule.verification).toBeDefined();
    expect(dbModule.emailVerificationCode).toBeDefined();
  });
});
