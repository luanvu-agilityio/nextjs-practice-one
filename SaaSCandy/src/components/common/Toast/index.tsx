import { toast } from 'sonner';

// Icons
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Components
import { Typography } from '../Typography';

// Utils
import { cn } from '@/lib/utils';
import { ToastProps } from '@/types';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const showToast = (props: Omit<ToastProps, 'id'>) => {
  const {
    title,
    description,
    variant = 'success',
    icon,
    hasCloseIcon = true,
    duration = 4000,
  } = props;

  const typedVariant = variant as keyof typeof toastIcons;
  const IconComponent = toastIcons[typedVariant];

  return toast.custom(
    t => (
      <div
        className={cn(
          'flex max-w-[360px] w-full gap-3 rounded-lg py-3 px-4 shadow-lg border text-lg',
          {
            'bg-success-background text-white border-success-background':
              variant === 'success',
            'bg-destructive-background text-white border-destructive-background':
              variant === 'error',
            'bg-warning-background text-white border-warning-background':
              variant === 'warning',
            'bg-info-background text-white border-info-background':
              variant === 'info',
          }
        )}
      >
        <div className='flex-shrink-0'>
          {icon || <IconComponent className='size-5' />}
        </div>

        <div className='flex flex-1 flex-col items-start gap-1'>
          <div className='font-medium text-sm'>{title}</div>
          {description && (
            <Typography className='text-xs opacity-90'>
              {description}
            </Typography>
          )}
        </div>

        {hasCloseIcon && (
          <button
            className='flex text-current cursor-pointer opacity-70 hover:opacity-100'
            aria-label='Close'
            onClick={() => toast.dismiss(t)}
          >
            <X className='size-4' />
          </button>
        )}
      </div>
    ),
    { duration }
  );
};

export { showToast };
