export type HttpError = {
  _tag: 'HttpError';
  status: number;
  message: string;
  body?: unknown;
};

export const makeHttpError = (
  status: number,
  message: string,
  body?: unknown
): HttpError => ({
  _tag: 'HttpError',
  status,
  message,
  body,
});

export const isHttpError = (v: unknown): v is HttpError =>
  typeof v === 'object' &&
  v !== null &&
  (v as Record<string, unknown>)['_tag'] === 'HttpError';

export const toJsHttpError = (
  e: HttpError
): Error & { status: number; data?: unknown } => {
  const err = new Error(e.message) as Error & {
    status: number;
    data?: unknown;
  };
  err.status = e.status;
  err.data = e.body;
  return err;
};

export type AuthError = {
  _tag: 'AuthError';
  code: 'InvalidCredentials' | '2FARequired' | 'NotAuthorized' | 'Other';
  message: string;
};

export const makeAuthError = (
  code: AuthError['code'],
  message: string
): AuthError => ({
  _tag: 'AuthError',
  code,
  message,
});

export type ValidationError = {
  _tag: 'ValidationError';
  issues: { path: string; message: string }[];
};

export const makeValidationError = (
  issues: ValidationError['issues']
): ValidationError => ({
  _tag: 'ValidationError',
  issues,
});

export type ExternalServiceError = {
  _tag: 'ExternalServiceError';
  service: string;
  cause?: unknown;
};

export const makeExternalServiceError = (
  service: string,
  cause?: unknown
): ExternalServiceError => ({
  _tag: 'ExternalServiceError',
  service,
  cause,
});

export type NotFoundError = {
  _tag: 'NotFoundError';
  resource: string;
  id?: string;
};

export const makeNotFoundError = (
  resource: string,
  id?: string
): NotFoundError => ({
  _tag: 'NotFoundError',
  resource,
  id,
});

export type AppError =
  | HttpError
  | AuthError
  | ValidationError
  | ExternalServiceError
  | NotFoundError;
