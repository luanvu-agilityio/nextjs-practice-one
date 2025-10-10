'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

// Utils
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-semibold text-md leading-none tracking-normal rounded-xl',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-orange-background text-white',
          'hover:opacity-90',
          'focus-visible:ring-primary',
        ],
        secondary: [
          'bg-white text-orange-background',
          'border border-orange-background',
          'hover:bg-orange-background hover:text-white',
          'focus-visible:ring-primary',
        ],
        tertiary: [
          'bg-white text-orange-background border-none',
          'hover:text-primary',
        ],
      },
      size: {
        small: 'px-4 py-2.5',
        large: 'px-9 py-5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'large',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants, type ButtonProps };
