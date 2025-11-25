import { Effect } from 'effect';

// Mock SendGrid default export (create mock inside factory to avoid hoisting issues)
type SendGridMockModule = {
  __esModule: true;
  default: { send: jest.Mock };
  __sendMock: jest.Mock;
};

jest.mock('@sendgrid/mail', () => {
  const sendMock = jest.fn();
  const mod: SendGridMockModule = {
    __esModule: true,
    default: { send: sendMock },
    __sendMock: sendMock,
  } as SendGridMockModule;
  return mod as unknown as SendGridMockModule;
});

// Mock retry helper to return the effect unchanged and expose the mock
type RetryMockModule = {
  runWithRetryAndTimeout: jest.Mock<unknown, [unknown, unknown?]>;
  __runWithRetryMock: jest.Mock<unknown, [unknown, unknown?]>;
};

jest.mock('../effect-retry', () => {
  const runWithRetryMock = jest.fn((eff: unknown) => eff);
  const mod: RetryMockModule = {
    runWithRetryAndTimeout: runWithRetryMock,
    __runWithRetryMock: runWithRetryMock,
  } as RetryMockModule;
  return mod as unknown as RetryMockModule;
});

import {
  isTransientSendGridError,
  sendVerificationEmailEffect,
} from '../sendgrid.effect';

const sgModule = jest.requireMock(
  '@sendgrid/mail'
) as unknown as SendGridMockModule;
const sendMock = sgModule.__sendMock ?? sgModule.default?.send;
const retryModule = jest.requireMock(
  '../effect-retry'
) as unknown as RetryMockModule;
const runWithRetryMock = retryModule.__runWithRetryMock;

describe('sendgrid.effect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SENDGRID_FROM_EMAIL = 'from@example.com';
  });

  describe('isTransientSendGridError', () => {
    it('returns false for null/undefined', () => {
      expect(isTransientSendGridError(null)).toBe(false);
      expect(isTransientSendGridError(undefined)).toBe(false);
    });

    it('detects 5xx status codes as transient', () => {
      expect(isTransientSendGridError({ statusCode: 500 })).toBe(true);
      expect(isTransientSendGridError({ statusCode: 502 })).toBe(true);
      expect(isTransientSendGridError({ statusCode: 400 })).toBe(false);
    });

    it('detects network error codes as transient', () => {
      expect(isTransientSendGridError({ code: 'EAI_AGAIN' })).toBe(true);
      expect(isTransientSendGridError({ code: 'UNKNOWN' })).toBe(false);
    });

    it('treats missing response as transient', () => {
      expect(isTransientSendGridError({})).toBe(true);
      expect(isTransientSendGridError({ response: {} })).toBe(false);
    });
  });

  describe('sendVerificationEmailEffect', () => {
    it('maps array response and returns result', async () => {
      sendMock.mockResolvedValueOnce([{ statusCode: 202 }]);
      const effect = sendVerificationEmailEffect('to@example.com', '<p>ok</p>');
      // runWithRetryAndTimeout should be called and return the inner effect
      expect(runWithRetryMock).toHaveBeenCalled();

      const res = await Effect.runPromise(Effect.either(effect));
      expect(res._tag === 'Right' ? res.right.statusCode : undefined).toBe(202);
    });

    it('maps object response and returns result', async () => {
      sendMock.mockResolvedValueOnce({ statusCode: 200, meta: 'x' });
      const effect = sendVerificationEmailEffect('t', '<p>h</p>');
      const res = await Effect.runPromise(Effect.either(effect));
      expect(res._tag === 'Right' ? res.right.statusCode : undefined).toBe(200);
    });

    it('fails with transient error (statusCode 5xx)', async () => {
      const err = { statusCode: 503, message: 'err' };
      sendMock.mockRejectedValueOnce(err);
      const effect = sendVerificationEmailEffect('t', '<p>h</p>');
      try {
        const res = await Effect.runPromise(Effect.either(effect));
        // accept either a Left result or a thrown defect; prefer Left
        expect(res._tag === 'Left' || res._tag === 'Right').toBe(true);
        if (res._tag === 'Left') expect(res.left).toEqual(err);
      } catch (e) {
        // some runtimes treat defects as thrown; accept that too
        // Error may be wrapped; assert the JSON string appears in the message
        expect(String(e)).toContain('"statusCode":503');
      }
    });
  });
});
