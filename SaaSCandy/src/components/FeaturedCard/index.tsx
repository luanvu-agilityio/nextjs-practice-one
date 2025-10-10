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
    <div className='flex flex-col gap-8 justify-between items-start bg-white rounded-3xl shadow-form hover:shadow-md transition-shadow p-10 '>
      <div className='flex items-center justify-center gap-6'>
        {icon && (
          <div className='w-15 h-15 rounded-full flex items-center justify-center'>
            {icon}
          </div>
        )}
        <Heading as='h4' size='md' content={title} className='text-primary' />
      </div>
      <Typography
        content={description}
        className='text-gray-background leading-relaxed'
      />
      {href && (
        <div className='text-orange-background font-semibold hover:text-orange-600 transition-colors inline-flex items-center gap-2'>
          {actionText}
          <ChevronRight />
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
      <Link href={href} className='block group'>
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
