import * as schema from '../schema';

describe('db schema', () => {
  it('should export user, account, session, verification, emailVerificationCode', () => {
    expect(schema.user).toBeDefined();
    expect(schema.account).toBeDefined();
    expect(schema.session).toBeDefined();
    expect(schema.verification).toBeDefined();
    expect(schema.emailVerificationCode).toBeDefined();
  });
});
