// Components
import { Typography } from '../Typography';

// Utils
import { cn } from '@/lib/utils';
import { getFriendlyMessage } from '@/lib/getFriendlyMessage';

interface ErrorMessageProps {
  error?: unknown;
  className?: string;
  customMessage?: string;
  testId?: string;
}

const ErrorMessage = ({
  customMessage,
  error,
  className = '',
  testId = 'error',
}: ErrorMessageProps) => {
  const message = customMessage ?? getFriendlyMessage(error);
  return (
    <Typography
      className={cn('text-destructive-background text-lg', className)}
      data-testid={testId}
    >
      {message}
    </Typography>
  );
};

export { getFriendlyMessage, ErrorMessage };
