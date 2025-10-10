// Components
import { Typography } from '../Typography';

// Constants
import {
  ERROR_INSTANCE_KEYWORDS,
  GENERAL_MESSAGES,
  HTTP_STATUS_MESSAGES,
  STRING_ERROR_KEYWORDS,
} from '@/constants';

// Utils
import { cn } from '@/lib/utils';

export type HttpError = {
  status?: number;
  data?: unknown;
  message?: string;
};

interface ErrorMessageProps {
  error?: unknown;
  className?: string;
  customMessage?: string;
}

function handleStringError(errorString: string): string {
  const s = errorString.toLowerCase();

  // Check for keywords in the error string
  for (const [keyword, message] of Object.entries(STRING_ERROR_KEYWORDS)) {
    if (s.includes(keyword.toLowerCase())) {
      return message;
    }
  }

  return GENERAL_MESSAGES.SOMETHING_WRONG;
}

function handleErrorInstance(error: Error): string {
  const msg = error.message.toLowerCase();

  // Check for exact matches first
  for (const [keyword, message] of Object.entries(ERROR_INSTANCE_KEYWORDS)) {
    if (msg.includes(keyword)) {
      return message;
    }
  }

  return GENERAL_MESSAGES.SOMETHING_WRONG;
}

function handleHttpError(status: number): string {
  return (
    HTTP_STATUS_MESSAGES[status as keyof typeof HTTP_STATUS_MESSAGES] ||
    GENERAL_MESSAGES.SOMETHING_WRONG
  );
}

function getFriendlyMessage(err: unknown): string {
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
}

const ErrorMessage = ({
  customMessage,
  error,
  className = '',
}: ErrorMessageProps) => {
  const message = customMessage ?? getFriendlyMessage(error);
  return (
    <Typography
      className={cn('text-destructive-background text-lg', className)}
    >
      {message}
    </Typography>
  );
};

export { getFriendlyMessage, ErrorMessage };
