import { logger, info, error } from '../logger';

// Mock the Toast module
const mockShowToast = jest.fn();
jest.mock('@/components/common/Toast', () => ({
  showToast: mockShowToast,
}));

describe('logger', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore window if it was deleted
    if (!globalThis.window && originalWindow) {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    }
  });

  describe('on server (no window)', () => {
    beforeEach(() => {
      // Remove window to simulate server environment
      delete (globalThis as Record<string, unknown>).window;
    });

    it('info does not call showToast when window is undefined', () => {
      logger.info('test message');
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('error does not call showToast when window is undefined', () => {
      logger.error('test error');
      expect(mockShowToast).not.toHaveBeenCalled();
    });
  });

  describe('on client (with window)', () => {
    beforeEach(() => {
      // Ensure window exists
      if (!globalThis.window) {
        Object.defineProperty(globalThis, 'window', {
          value: {},
          writable: true,
          configurable: true,
        });
      }
    });

    it('info calls showToast with correct parameters', async () => {
      logger.info('test message');

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Info',
        description: 'test message',
        variant: 'info',
      });
    });

    it('error calls showToast with correct parameters', async () => {
      logger.error('test error');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'test error',
        variant: 'error',
      });
    });

    it('handles multiple arguments', async () => {
      logger.info('message', 123, { key: 'value' });

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Info',
        description: 'message 123 {"key":"value"}',
        variant: 'info',
      });
    });

    it('handles objects that cannot be stringified', async () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      logger.info('message', circular);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Info',
          variant: 'info',
        })
      );
    });

    it('exported info function works', async () => {
      info('test info');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Info',
        description: 'test info',
        variant: 'info',
      });
    });

    it('exported error function works', async () => {
      error('test error');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'test error',
        variant: 'error',
      });
    });
  });
});
