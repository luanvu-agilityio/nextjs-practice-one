import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Utils
import { cn } from '@/lib/utils';

const iconButtonVariants = cva(
  'cursor-pointer inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed button-animation',
  {
    variants: {
      variant: {
        primary: 'bg-white text-white hover:opacity-90 border-none',
        outline:
          'bg-transparent border border-orange-background text-orange-background hover:bg-white-background hover:text-white',
        ghost: 'bg-transparent border-none text-primary hover:opacity-90',
        disabled:
          'border border-gray-foreground text-gray-foreground cursor-not-allowed',
      },
      size: {
        md: 'w-6 h-6 p-4',
        lg: 'w-8 h-8 font-secondary',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className, variant, size, ...props }, ref) => {
    return (
      <button
        data-testid='icon-button'
        ref={ref}
        className={cn(iconButtonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
