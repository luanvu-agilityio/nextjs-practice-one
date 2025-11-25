import { ReactNode } from 'react';

// Utils
import { cn } from '@/lib/utils';

interface TypographyProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  content?: string;
  children?: ReactNode;
}

const Typography = ({
  size = 'md',
  className,
  content,
  children,
}: TypographyProps) => (
  <p
    role='paragraph'
    className={cn(
      {
        'text-xs': size === 'xs',
        'text-sm': size === 'sm',
        'text-md': size === 'md',
        'text-lg': size === 'lg',
        'text-xl': size === 'xl',
        'text-3xl': size === '2xl',
      },
      className
    )}
  >
    {children ?? content}
  </p>
);

Typography.displayName = 'Typography';

export { Typography, type TypographyProps };
