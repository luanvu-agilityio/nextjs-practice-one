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
    <section className={`py-16 ${className}`} style={style}>
      <div className={`max-w-[1296px] mx-auto ${containerClassName}`}>
        {(title || subtitle) && (
          <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
            {title && (
              <Heading
                as='h2'
                size='3xl'
                content={title}
                className='text-gray-900 font-bold mb-4'
              />
            )}
            {subtitle && (
              <Typography
                size='lg'
                content={subtitle}
                className='text-gray-600 leading-relaxed max-w-3xl mx-auto'
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
