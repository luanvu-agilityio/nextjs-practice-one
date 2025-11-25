import {
  ERROR_INSTANCE_KEYWORDS,
  GENERAL_MESSAGES,
  HTTP_STATUS_MESSAGES,
  STRING_ERROR_KEYWORDS,
} from '@/constants';

type HttpError = {
  status?: number;
  data?: unknown;
  message?: string;
};

const handleStringError = (errorString: string): string => {
  const s = errorString.toLowerCase();

  for (const [keyword, message] of Object.entries(STRING_ERROR_KEYWORDS)) {
    if (s.includes(keyword.toLowerCase())) {
      return message;
    }
  }

  return GENERAL_MESSAGES.SOMETHING_WRONG;
};

const handleErrorInstance = (error: Error): string => {
  const msg = error.message.toLowerCase();

  for (const [keyword, message] of Object.entries(ERROR_INSTANCE_KEYWORDS)) {
    if (msg.includes(keyword)) {
      return message;
    }
  }

  return GENERAL_MESSAGES.SOMETHING_WRONG;
};

const handleHttpError = (status: number): string => {
  return (
    HTTP_STATUS_MESSAGES[status as keyof typeof HTTP_STATUS_MESSAGES] ||
    GENERAL_MESSAGES.SOMETHING_WRONG
  );
};

export const getFriendlyMessage = (err: unknown): string => {
  if (typeof err === 'string') {
    return handleStringError(err);
  }

  if (err instanceof Error && err.message) {
    return handleErrorInstance(err);
  }

  const httpError = err as HttpError | null;
  if (httpError?.status) {
    return handleHttpError(httpError.status);
  }

  return GENERAL_MESSAGES.SOMETHING_WRONG;
};

export default getFriendlyMessage;
