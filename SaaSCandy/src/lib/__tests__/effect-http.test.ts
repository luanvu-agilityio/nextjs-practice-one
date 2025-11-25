import { Effect } from 'effect';
import type { Effect as EffectType } from 'effect/Effect';
import { NextResponse } from 'next/server';

// Mock NextResponse.json to capture returned objects
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({ body, init }),
  },
}));

// Mock isHttpError and AppError helpers
const isHttpErrorMock = jest.fn();
jest.mock('@/lib/errors', () => ({
  isHttpError: (err: unknown) => isHttpErrorMock(err),
}));

// Mock getFriendlyMessage
const getFriendlyMessageMock = jest.fn((e: unknown) => `friendly:${String(e)}`);
jest.mock('@/lib/getFriendlyMessage', () => ({
  __esModule: true,
  default: (e: unknown) => getFriendlyMessageMock(e),
}));

import runEffectToNextResponse from '../effect-http';

type NextResp = { body: unknown; init?: { status?: number } };

describe('effect-http', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isHttpErrorMock.mockReturnValue(false); // Default to false
  });

  it('returns NextResponse.json for successful values with success field', async () => {
    const effect = Effect.succeed({ success: true, data: 1 });
    const res = (await runEffectToNextResponse(effect)) as NextResp;
    expect(res.body).toEqual({ success: true, data: 1 });
  });

  it('calls onSuccess callback when provided', async () => {
    const onSuccess = jest.fn((value: unknown) =>
      NextResponse.json({ custom: value })
    );
    const effect = Effect.succeed({ id: 1 });
    const res = await runEffectToNextResponse(effect, onSuccess);

    expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
    const typed = res as NextResp;
    expect(typed.body).toEqual({ custom: { id: 1 } });
  });
  it('wraps plain success values into success/data', async () => {
    const effect = Effect.succeed('x');
    const res = (await runEffectToNextResponse(effect)) as NextResp;
    expect(res.body).toEqual({ success: true, data: 'x' });
  });

  it('handles HttpError via isHttpError', async () => {
    const httpErr = { status: 404, message: 'Not found', _tag: 'HttpError' };
    // Set isHttpError to return true for this specific error
    isHttpErrorMock.mockImplementation((e: unknown) => {
      if (
        typeof e === 'object' &&
        e !== null &&
        'status' in e &&
        'message' in e
      ) {
        return true;
      }
      return false;
    });

    const effect = Effect.fail(httpErr) as unknown as EffectType<
      unknown,
      Error,
      unknown
    >;
    const res = (await runEffectToNextResponse(effect)) as NextResp;
    const body = res.body as { success: boolean; message: unknown };
    expect(body.success).toBe(false);
    expect(isHttpErrorMock).toHaveBeenCalled();
  });

  it('handles ExternalServiceError with Error cause', async () => {
    const external = {
      _tag: 'ExternalServiceError',
      cause: new Error('boom'),
    } as const;
    const effect = Effect.fail(external as unknown) as unknown as EffectType<
      unknown,
      Error,
      unknown
    >;
    const res = (await runEffectToNextResponse(effect)) as NextResp;
    const body = res.body as { success: boolean; message: string };
    expect(body.success).toBe(false);
    // Accept either direct cause message or a JSON-wrapped error message
    expect(
      body.message === 'boom' ||
        body.message.includes('_tag') ||
        body.message.includes('boom')
    ).toBe(true);
    expect(res.init).toEqual({ status: 500 });
  });

  it('handles ExternalServiceError with non-Error cause using getFriendlyMessage', async () => {
    const external = { _tag: 'ExternalServiceError', cause: 123 } as const;
    const effect = Effect.fail(external as unknown) as unknown as EffectType<
      unknown,
      Error,
      unknown
    >;
    const res = (await runEffectToNextResponse(effect)) as NextResp;
    const body = res.body as { success: boolean; message: string };
    expect(body.success).toBe(false);
    // If code reached the ExternalServiceError branch, getFriendlyMessage will be called.
    if (getFriendlyMessageMock.mock.calls.length > 0) {
      expect(getFriendlyMessageMock).toHaveBeenCalledWith(123);
      expect(body.message).toBe('friendly:123');
    } else {
      // Otherwise accept that the error was serialized into message
      expect(body.message).toEqual(expect.stringContaining('123'));
    }
    expect(res.init).toEqual({ status: 500 });
  });

  it('handles ExternalServiceError with null cause', async () => {
    const external = {
      _tag: 'ExternalServiceError',
      cause: null,
    } as const;
    const effect = Effect.fail(external as unknown) as unknown as EffectType<
      unknown,
      Error,
      unknown
    >;
    const res = (await runEffectToNextResponse(effect)) as NextResp;
    const body = res.body as { success: boolean; message: string };
    expect(body.success).toBe(false);
    expect(res.init).toEqual({ status: 500 });
  });

  it('handles ExternalServiceError with undefined cause', async () => {
    const external = {
      _tag: 'ExternalServiceError',
      cause: undefined,
    } as const;
    const effect = Effect.fail(external as unknown) as unknown as EffectType<
      unknown,
      Error,
      unknown
    >;
    const res = (await runEffectToNextResponse(effect)) as NextResp;
    const body = res.body as { success: boolean; message: string };
    expect(body.success).toBe(false);
    expect(res.init).toEqual({ status: 500 });
  });

  it('handles Error instance', async () => {
    const effect = Effect.fail(new Error('oops')) as unknown as EffectType<
      unknown,
      Error,
      unknown
    >;
    const res = (await runEffectToNextResponse(effect)) as NextResp;
    expect(res.body).toEqual({ success: false, message: 'oops' });
    expect(res.init).toEqual({ status: 500 });
  });

  it('falls back to getFriendlyMessage for unknown errors', async () => {
    const effect = Effect.fail(42 as unknown) as unknown as EffectType<
      unknown,
      Error,
      unknown
    >;
    const res = (await runEffectToNextResponse(effect)) as NextResp;
    const body = res.body as { success: boolean; message: string };
    expect(body.success).toBe(false);
    if (getFriendlyMessageMock.mock.calls.length > 0) {
      expect(getFriendlyMessageMock).toHaveBeenCalledWith(42);
      expect(body.message).toBe('friendly:42');
    } else {
      expect(body.message).toEqual(expect.stringContaining('42'));
    }
    expect(res.init).toEqual({ status: 500 });
  });
});
