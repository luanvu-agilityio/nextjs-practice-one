import { ReactNode } from 'react';
import Link from 'next/link';

// Components
import { Heading, Typography } from '../common';

// Icons
import { ChevronRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  href?: string;
  actionText?: string;
}

interface CardContentProps {
  title: string;
  description: string;
  icon?: ReactNode;
  href?: string;
  actionText: string;
}

function CardContent({
  title,
  description,
  icon,
  href,
  actionText,
}: Readonly<CardContentProps>) {
  return (
    <div className='flex flex-col gap-6 sm:gap-8 justify-between items-start bg-white rounded-2xl sm:rounded-3xl shadow-form hover:shadow-md transition-shadow p-6 sm:p-8 lg:p-10 h-full'>
      <div className='flex items-center justify-start gap-4 sm:gap-6 w-full'>
        {icon && (
          <div className='w-12 h-12 sm:w-14 sm:h-14 lg:w-15 lg:h-15 rounded-full flex items-center justify-center flex-shrink-0'>
            {icon}
          </div>
        )}
        <Heading
          as='h4'
          size='md'
          content={title}
          className='text-primary text-lg sm:text-xl lg:text-2xl'
        />
      </div>
      <Typography
        content={description}
        className='text-gray-background leading-relaxed  sm:text-lg'
      />
      {href && (
        <div className='text-orange-background font-semibold hover:text-orange-600 transition-colors inline-flex items-center gap-2  sm:text-lg'>
          {actionText}
          <ChevronRight className='w-5 h-5' />
        </div>
      )}
    </div>
  );
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  actionText = 'Read More',
}: Readonly<FeatureCardProps>) {
  if (href) {
    return (
      <Link href={href} className='block group h-full'>
        <CardContent
          title={title}
          description={description}
          icon={icon}
          href={href}
          actionText={actionText}
        />
      </Link>
    );
  }

  return (
    <CardContent
      title={title}
      description={description}
      icon={icon}
      href={href}
      actionText={actionText}
    />
  );
}
