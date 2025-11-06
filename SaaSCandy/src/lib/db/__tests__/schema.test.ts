import * as schema from '../schema';

describe('db schema', () => {
  it('should export user, account, session, verification, emailVerificationCode', () => {
    expect(schema.user).toBeDefined();
    expect(schema.account).toBeDefined();
    expect(schema.session).toBeDefined();
    expect(schema.verification).toBeDefined();
    expect(schema.emailVerificationCode).toBeDefined();
  });

  it('exported tables contain expected column keys', () => {
    // Helper to test presence of keys on table objects without using `any`.
    const hasKey = (obj: object, key: string) =>
      Object.hasOwn(obj, key as PropertyKey);

    // smsVerificationCode table
    expect(schema.smsVerificationCode).toBeDefined();
    expect(hasKey(schema.smsVerificationCode, 'id')).toBe(true);
    expect(hasKey(schema.smsVerificationCode, 'userId')).toBe(true);
    expect(hasKey(schema.smsVerificationCode, 'phone')).toBe(true);
    expect(hasKey(schema.smsVerificationCode, 'code')).toBe(true);

    // user table
    expect(hasKey(schema.user, 'id')).toBe(true);
    expect(hasKey(schema.user, 'name')).toBe(true);
    expect(hasKey(schema.user, 'email')).toBe(true);
    expect(hasKey(schema.user, 'password')).toBe(true);
    expect(hasKey(schema.user, 'createdAt')).toBe(true);

    // session table
    expect(hasKey(schema.session, 'id')).toBe(true);
    expect(hasKey(schema.session, 'token')).toBe(true);
    expect(hasKey(schema.session, 'userId')).toBe(true);

    // account table
    expect(hasKey(schema.account, 'id')).toBe(true);
    expect(hasKey(schema.account, 'accountId')).toBe(true);
    expect(hasKey(schema.account, 'providerId')).toBe(true);
    expect(hasKey(schema.account, 'userId')).toBe(true);

    // verification table
    expect(hasKey(schema.verification, 'id')).toBe(true);
    expect(hasKey(schema.verification, 'identifier')).toBe(true);
    expect(hasKey(schema.verification, 'value')).toBe(true);

    // emailVerificationCode table
    expect(hasKey(schema.emailVerificationCode, 'id')).toBe(true);
    expect(hasKey(schema.emailVerificationCode, 'userId')).toBe(true);
    expect(hasKey(schema.emailVerificationCode, 'email')).toBe(true);
    expect(hasKey(schema.emailVerificationCode, 'tempPassword')).toBe(true);
  });
});
