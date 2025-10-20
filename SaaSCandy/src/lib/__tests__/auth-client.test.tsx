import * as authClientModule from '../auth-client';

describe('auth-client exports', () => {
  it('should export authClient', () => {
    expect(authClientModule.authClient).toBeDefined();
  });
});
