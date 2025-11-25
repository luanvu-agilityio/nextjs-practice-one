'use client';

import { useEffect, useRef } from 'react';
import { Heading, Typography } from '@/components/ui';

interface LazySectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  centered?: boolean;
  bgImageUrl?: string;
  style?: React.CSSProperties;
}

const LazySection = ({
  title,
  subtitle,
  children,
  className = '',
  containerClassName = '',
  centered = false,
  bgImageUrl,
  style,
}: Readonly<LazySectionProps>) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !bgImageUrl) return;
    let loaded = false;
    const observer = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !loaded) {
            node.style.backgroundImage = `url('${bgImageUrl}')`;
            loaded = true;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [bgImageUrl]);

  return (
    <section
      ref={ref}
      className={`py-12 sm:py-16 px-4 sm:px-6 ${className}`}
      style={{
        ...style,
        backgroundSize: bgImageUrl ? 'cover' : undefined,
        backgroundRepeat: bgImageUrl ? 'no-repeat' : undefined,
        backgroundPosition: bgImageUrl ? 'center' : undefined,
        backgroundImage: undefined, // Start with no image
      }}
    >
      <div className={`max-w-[1296px] mx-auto  lg:px-0 ${containerClassName}`}>
        {(title || subtitle) && (
          <div className={`mb-8 sm:mb-12 ${centered ? 'text-center' : ''}`}>
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
                className='text-gray-background leading-relaxed max-w-3xl mx-auto sm:text-lg'
              />
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export { LazySection };
