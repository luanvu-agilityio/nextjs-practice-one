'use client';

import { ComponentType } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Utils
import { cn } from '@/lib/utils';

const socialButtonVariants = cva([
  'flex items-center justify-center gap-3',
  'w-full px-4 py-3 rounded-xl',
  'text-md font-medium transition-colors',
  'border border-gray-300 bg-white text-gray-700',
  'hover:bg-gray-50 hover:border-gray-400',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
]);

interface SocialButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof socialButtonVariants> {
  provider: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function SocialButton({
  provider,
  icon: Icon,
  children,
  className,
  ...props
}: Readonly<SocialButtonProps>) {
  return (
    <button
      className={cn(socialButtonVariants(), className)}
      data-provider={provider}
      aria-label={`Sign in with ${provider}`}
      {...props}
    >
      <Icon className='w-5 h-5' />
      {children}
    </button>
  );
}
export default SocialButton;
