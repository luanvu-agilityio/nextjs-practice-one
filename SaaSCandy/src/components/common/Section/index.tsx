import { CSSProperties, ReactNode } from 'react';

// Components
import { Heading, Typography } from '@/components/common';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  centered?: boolean;
  style?: CSSProperties;
}

function Section({
  title,
  subtitle,
  children,
  className = '',
  containerClassName = '',
  style,
  centered = false,
}: Readonly<SectionProps>) {
  return (
    <section className={`py-12 sm:py-16 ${className}`} style={style}>
      <div
        className={`max-w-[1296px] mx-auto px-4 sm:px-6 lg:px-0 ${containerClassName}`}
      >
        {(title || subtitle) && (
          <div className={`mb-8 sm:mb-12 ${centered ? 'text-center' : ''}`}>
            {title && (
              <Heading
                as='h2'
                size='3xl'
                content={title}
                className='text-gray-900 font-bold mb-3 sm:mb-4 text-2xl sm:text-4xl lg:text-5xl'
              />
            )}
            {subtitle && (
              <Typography
                size='lg'
                content={subtitle}
                className='text-gray-600 leading-relaxed max-w-3xl mx-auto sm:text-lg'
              />
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
export default Section;
