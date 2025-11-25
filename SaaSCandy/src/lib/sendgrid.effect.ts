import { pipe, Effect } from 'effect';
import sgMail from '@sendgrid/mail';

// Helpers
import type { RetryOptions } from './effect-retry';
import { runWithRetryAndTimeout } from './effect-retry';

export interface SendGridSendResult {
  readonly statusCode?: number;
  readonly body?: unknown;
}

export function isTransientSendGridError(err: unknown): boolean {
  if (err == null) return false;
  if (typeof err === 'object') {
    const e = err as { statusCode?: number; code?: string; response?: unknown };
    if (typeof e.statusCode === 'number') return e.statusCode >= 500;
    if (typeof e.code === 'string')
      return ['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN'].includes(e.code);
    // If no response object it is likely a network error
    if (!e.response) return true;
  }
  return false;
}

export function sendVerificationEmailEffect(
  to: string,
  html: string,
  opts?: RetryOptions
): Effect.Effect<SendGridSendResult, Error, never> {
  const send = pipe(
    Effect.promise(() =>
      // delegate to SendGrid; let Effect.promise capture rejections
      sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL ?? '',
        subject: 'Verify your email',
        html,
      })
    ),
    // Normalize/sendgrid response into SendGridSendResult shape
    Effect.map(res => {
      const resUnknown = res as unknown;
      let statusCode: number | undefined;
      if (Array.isArray(resUnknown)) {
        const first = resUnknown[0] as { statusCode?: number } | undefined;
        statusCode = first?.statusCode;
      } else if (resUnknown && typeof resUnknown === 'object') {
        statusCode = (resUnknown as { statusCode?: number }).statusCode;
      }
      return { statusCode, body: resUnknown } as SendGridSendResult;
    }),
    Effect.catchAll(err =>
      isTransientSendGridError(err)
        ? Effect.fail(err as Error)
        : Effect.die(err as Error)
    )
  );

  return runWithRetryAndTimeout(
    send,
    opts ?? { maxRetries: 3, baseDelayMs: 300, jitter: 0.2, timeoutMs: 7000 }
  );
}
