'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Components
import { Heading, Skeleton } from '@/components/ui';

interface BlogCardProps {
  slug: string;
  title: string;
  image?: string;
  date: string;
}

const BlogCard = ({ slug, title, image, date }: Readonly<BlogCardProps>) => {
  return (
    <article className='group'>
      <Link
        href={`/blog/${slug}`}
        className='block rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white'
      >
        <div className='w-full overflow-hidden'>
          {image ? (
            <Image
              alt={title}
              className='object-cover w-full h-48 sm:h-60 lg:h-71 group-hover:scale-105 transition-transform duration-300'
              src={image}
              width={416}
              height={284}
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 416px'
              loading='lazy'
            />
          ) : (
            <div className='w-full h-48 sm:h-60 lg:h-71 flex items-center justify-center text-gray-background bg-gray-100'>
              No image
            </div>
          )}
        </div>

        <div className='flex flex-col gap-3 sm:gap-4 py-6 sm:py-8 lg:py-10 px-4 sm:px-0'>
          <Heading
            as='h3'
            size='md'
            content={title}
            className='text-primary font-medium text-lg sm:text-xl line-clamp-2'
          />
          <div className='text-xs sm:text-sm text-gray-background'>{date}</div>
        </div>
      </Link>
    </article>
  );
};

const BlogCardSkeleton = () => {
  return (
    <article className='group'>
      <div className='block rounded-lg overflow-hidden bg-white'>
        <Skeleton className='object-cover w-full h-48 sm:h-60 lg:h-71' />
        <div className='flex flex-col gap-3 sm:gap-4 py-6 sm:py-8 lg:py-10 px-4 sm:px-0'>
          <Skeleton className='h-6 sm:h-7 w-3/4 mb-2' />
          <Skeleton className='h-4 w-1/4' />
        </div>
      </div>
    </article>
  );
};

export { BlogCard, BlogCardSkeleton };
