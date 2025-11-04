// Lightweight logger wrapper
// - On the server (no window) this is a no-op to avoid console output.
// - On the client it dynamically imports the toast helper and shows a toast for errors/info.
// This prevents direct use of console.log/console.error across the codebase.

type AnyArgs = Array<unknown>;

async function showClientToast(level: 'info' | 'error', args: AnyArgs) {
  try {
    const mod = await import('@/components/common/Toast');
    const { showToast } = mod;
    const message = args
      .map(a => {
        try {
          return typeof a === 'string' ? a : JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(' ');

    showToast({
      title: level === 'error' ? 'Error' : 'Info',
      description: message,
      variant: level === 'error' ? 'error' : 'info',
    });
  } catch {
    // TODO: send this error to a remote logging service here.
  }
}

export const logger = {
  info: (...args: AnyArgs) => {
    if (globalThis.window === undefined) return;
    void showClientToast('info', args);
  },
  error: (...args: AnyArgs) => {
    if (globalThis.window === undefined) return;
    void showClientToast('error', args);
  },
};

export const info = logger.info;
export const error = logger.error;

export default logger;
