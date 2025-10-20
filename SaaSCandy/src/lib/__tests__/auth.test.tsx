import * as authModule from '../auth';

describe('auth actions', () => {
  it('should export signInAction, signUpAction, signOutAction', () => {
    expect(authModule.signInAction).toBeInstanceOf(Function);
    expect(authModule.signUpAction).toBeInstanceOf(Function);
    expect(authModule.signOutAction).toBeInstanceOf(Function);
  });
});
