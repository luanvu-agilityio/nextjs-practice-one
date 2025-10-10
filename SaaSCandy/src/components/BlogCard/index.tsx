'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Components
import { Heading } from '@/components/common';

interface BlogCardProps {
  slug: string;
  title: string;
  image?: string;
  date: string;
}

function BlogCard({ slug, title, image, date }: Readonly<BlogCardProps>) {
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
              className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
              src={image}
              width={416}
              height={284}
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-background'>
              No image
            </div>
          )}
        </div>

        <div className='flex flex-col gap-4 py-10'>
          <Heading
            as='h3'
            size='md'
            content={title}
            className='text-primary font-medium text-xl'
          />
          <div className='text-xs text-gray-background'>{date}</div>
        </div>
      </Link>
    </article>
  );
}
export { BlogCard };
