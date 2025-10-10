import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';

// Icons
import { ChevronRight, MoreHorizontal } from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';

const breadcrumbVariants = cva('flex items-center gap-1.5 text-sm', {
  variants: {
    variant: {
      light: 'text-slate-600',
      dark: 'text-slate-300',
    },
  },
  defaultVariants: {
    variant: 'light',
  },
});

const breadcrumbItemVariants = cva(
  'inline-flex items-center gap-1.5 transition-colors',
  {
    variants: {
      variant: {
        light: 'hover:text-slate-900',
        dark: 'hover:text-white',
      },
      active: {
        true: 'font-medium',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'light',
        active: true,
        className: 'text-slate-900',
      },
      {
        variant: 'dark',
        active: true,
        className: 'text-white',
      },
    ],
    defaultVariants: {
      variant: 'light',
      active: false,
    },
  }
);

const breadcrumbSeparatorVariants = cva('flex items-center', {
  variants: {
    variant: {
      light: 'text-slate-400',
      dark: 'text-slate-500',
    },
  },
  defaultVariants: {
    variant: 'light',
  },
});

interface BreadcrumbProps
  extends React.ComponentPropsWithoutRef<'nav'>,
    VariantProps<typeof breadcrumbVariants> {}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, variant, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label='breadcrumb'
      className={cn(breadcrumbVariants({ variant }), className)}
      {...props}
    />
  )
);

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

interface BreadcrumbItemProps
  extends React.ComponentPropsWithoutRef<'li'>,
    VariantProps<typeof breadcrumbItemVariants> {}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, variant, active, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(breadcrumbItemVariants({ variant, active }), className)}
      {...props}
    />
  )
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role='link'
    aria-disabled='true'
    aria-current='page'
    className={cn('font-normal text-foreground', className)}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

interface BreadcrumbSeparatorProps
  extends React.ComponentPropsWithoutRef<'li'>,
    VariantProps<typeof breadcrumbSeparatorVariants> {
  children?: React.ReactNode;
}

const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  BreadcrumbSeparatorProps
>(({ children, className, variant, ...props }, ref) => (
  <li
    ref={ref}
    role='presentation'
    aria-hidden='true'
    className={cn(breadcrumbSeparatorVariants({ variant }), className)}
    {...props}
  >
    {children ?? <ChevronRight className='h-4 w-4' />}
  </li>
));
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    role='presentation'
    aria-hidden='true'
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className='h-4 w-4' />
    <span className='sr-only'>More</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis';
Breadcrumb.displayName = 'Breadcrumb';

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
