'use client';

import { ComponentProps, ReactNode, useId, useState } from 'react';

// Components
import { Typography } from '../Typography';

// Icons
import { Eye, EyeOff } from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';

interface InputProps extends ComponentProps<'input'> {
  label?: string;
  variant?: 'primary' | 'secondary';
  hideLabel?: boolean;
  errorMessage?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  leftElementClasses?: string;
  rightElementClasses?: string;
  showPasswordToggle?: boolean;
}

const Input = ({
  id,
  label = '',
  className,
  type = 'text',
  variant = 'primary',
  hideLabel = false,
  disabled,
  errorMessage,
  leftElement,
  rightElement,
  leftElementClasses,
  rightElementClasses,
  showPasswordToggle = false,
  onChange,
  ...props
}: InputProps) => {
  const internalId = useId();
  const resolvedId = id ?? `input-${internalId}`;
  const hasError = Boolean(errorMessage);

  const [showPassword, setShowPassword] = useState(false);

  let inputType = type;
  if (showPasswordToggle) {
    inputType = showPassword ? 'text' : 'password';
  }

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const resolvedRightElement = showPasswordToggle ? (
    <button
      type='button'
      onClick={togglePasswordVisibility}
      className='p-1 text-gray-foreground hover:text-gray-700 transition-colors'
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <EyeOff className='h-4 w-4' />
      ) : (
        <Eye className='h-4 w-4' />
      )}
    </button>
  ) : (
    rightElement
  );

  return (
    <div className='flex flex-col gap-2 w-full'>
      {/* Label */}
      {label && (
        <label
          htmlFor={resolvedId}
          className={cn('text-sm font-medium text-placeholder', {
            'sr-only': hideLabel,
          })}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          'flex items-center h-11 w-full min-w-0 rounded-lg border text-md transition-colors bg-transparent',
          'px-4 py-2.5 focus-within:border-white',
          {
            'border-gray-background': variant === 'primary',
            'border-gray-foreground bg-white': variant === 'secondary',
            'border-destructive ring-destructive/20': hasError,
            'cursor-not-allowed opacity-50': disabled,
          },
          className
        )}
      >
        {/* Left element */}
        {leftElement && (
          <span
            className={cn('flex mr-2 text-gray-foreground', leftElementClasses)}
          >
            {leftElement}
          </span>
        )}

        {/* Input */}
        <input
          id={resolvedId}
          type={inputType}
          disabled={disabled}
          aria-label={hideLabel ? label : undefined}
          aria-invalid={hasError}
          className={cn(
            'w-full bg-transparent outline-none placeholder:text-placeholder',
            'disabled:pointer-events-none disabled:cursor-not-allowed'
          )}
          onChange={onChange}
          {...props}
        />

        {/* Right element */}
        {resolvedRightElement && (
          <span
            className={cn(
              'flex ml-2 text-gray-foreground',
              rightElementClasses
            )}
          >
            {resolvedRightElement}
          </span>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <Typography className='text-md text-destructive-background'>
          {errorMessage}
        </Typography>
      )}
    </div>
  );
};

export { Input, type InputProps };
