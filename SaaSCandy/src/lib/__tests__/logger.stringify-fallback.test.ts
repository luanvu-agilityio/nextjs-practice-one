describe('logger stringify fallback', () => {
  beforeEach(() => {
    jest.resetModules();
    (globalThis as unknown as Record<string, unknown>).window = {};
  });

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>).window;
    jest.restoreAllMocks();
  });

  it('uses String(a) when JSON.stringify throws for circular objects', async () => {
    const showToast = jest.fn();
    jest.doMock('@/components/common/Toast', () => ({ showToast }));

    const mod = await import('../logger');

    // Create a circular object
    interface SelfRef {
      name: string;
      self?: SelfRef;
    }
    const a: SelfRef = { name: 'a' };
    a.self = a;

    mod.info(a);

    // wait a tick for async dynamic import
    await new Promise(res => setTimeout(res, 0));

    expect(showToast).toHaveBeenCalled();
    const call = showToast.mock.calls[0][0];
    // Description should include the String(a) fallback (e.g., '[object Object]')
    expect(call.description).toEqual(
      expect.stringContaining('[object Object]')
    );
  });
});
