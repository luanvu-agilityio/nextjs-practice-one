import { CSSProperties, ReactNode } from 'react';

// Components
import { Heading, Typography } from '@/components/common';

// Utils
import { cn } from '@/lib/utils';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  textClassName?: string;
  centered?: boolean;
  style?: CSSProperties;
}

const Section = ({
  title,
  subtitle,
  children,
  className = '',
  containerClassName = '',
  style,
  centered = false,
  headerClassName = '',
  textClassName = '',
}: Readonly<SectionProps>) => {
  return (
    <section className={`py-12 sm:py-16 ${className}`} style={style}>
      <div className={`max-w-[1296px] mx-auto  lg:px-0 ${containerClassName}`}>
        {(title || subtitle) && (
          <div
            className={`mb-8 sm:mb-12 ${centered ? 'text-center' : ''} ${headerClassName}`}
          >
            {title && (
              <Heading
                as='h2'
                size='3xl'
                content={title}
                className='text-primary font-bold mb-3 sm:mb-4 text-2xl sm:text-4xl lg:text-5xl'
              />
            )}
            {subtitle && (
              <Typography
                size='lg'
                content={subtitle}
                className={cn(
                  'text-gray-background leading-relaxed max-w-3xl mx-auto sm:text-lg',
                  textClassName
                )}
              />
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};
export { Section };
