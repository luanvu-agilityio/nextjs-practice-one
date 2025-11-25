import { ReactNode } from 'react';

// Utils
import { cn } from '@/lib/utils';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface HeadingProps {
  content: ReactNode;
  className?: string;
  as: HeadingTag;
  size?: HeadingSize;
}

const Heading = ({ as, size, className, content }: HeadingProps) => {
  const Tag = as;
  const ariaLevel = parseInt(as.substring(1), 10);

  return (
    <Tag
      role='heading'
      aria-level={ariaLevel}
      className={cn(
        {
          'text-md font-semibold': size === 'xs',
          'text-lg font-semibold': size === 'sm',
          'text-2xl font-semibold': size === 'md',
          'text-4xl font-semibold': size === 'lg',
          'text-5xl font-semibold': size === 'xl',
          'text-6xl font-semibold': size === '2xl',
          'text-7xl font-semibold': size === '3xl',
        },
        className
      )}
    >
      {content}
    </Tag>
  );
};

Heading.displayName = 'Heading';

export { Heading };
