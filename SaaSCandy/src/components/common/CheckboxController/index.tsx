'use client';

import { ComponentProps, ReactNode } from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';

// Components
import { Typography } from '../Typography';

interface CheckboxControllerProps<T extends FieldValues, K extends Path<T>>
  extends Omit<ComponentProps<'input'>, 'name' | 'type'> {
  name: K;
  control: Control<T>;
  label?: ReactNode;
}

const CheckboxController = <T extends FieldValues, K extends Path<T>>({
  name,
  control,
  label,
  className,
  ...props
}: CheckboxControllerProps<T, K>) => {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-start gap-3'>
        <input
          type='checkbox'
          checked={value || false}
          onChange={e => onChange(e.target.checked)}
          onBlur={onBlur}
          className={`mt-1 ${className}`}
          {...props}
        />
        {label && (
          <Typography className='text-lg text-blue-foreground'>
            {label}
          </Typography>
        )}
      </div>
      {error && (
        <Typography className='text-destructive-background text-sm'>
          {error.message}
        </Typography>
      )}
    </div>
  );
};

export { CheckboxController };
