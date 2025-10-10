'use client';

import { ChangeEvent, ComponentProps, FocusEvent } from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';

// Components
import { Input } from '../Input';

interface InputControllerProps<T extends FieldValues, K extends Path<T>>
  extends ComponentProps<typeof Input> {
  label: string;
  name: K;
  control: Control<T>;
  transformValueOnChange?: (value: string) => string | undefined;
}

const InputController = <T extends FieldValues, K extends Path<T>>({
  label,
  name,
  control,
  disabled,
  onChange: onChangeInput,
  onBlur: onBlurInput,
  transformValueOnChange,
  ...props
}: InputControllerProps<T, K>) => {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const finalValue = transformValueOnChange
      ? transformValueOnChange(rawValue)
      : rawValue;

    if (finalValue !== undefined) {
      onChange(finalValue);
    }

    onChangeInput?.(e);
  };

  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur();
    onBlurInput?.(e);
  };

  return (
    <Input
      name={name}
      label={label}
      disabled={disabled}
      value={value}
      errorMessage={error?.message}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      {...props}
    />
  );
};

export { InputController };
