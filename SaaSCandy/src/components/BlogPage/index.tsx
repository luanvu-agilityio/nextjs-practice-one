// Components
import Section from '../common/Section';
import { BlogCardSkeleton } from '../BlogCard';
import React, { Suspense } from 'react';

import BlogList from '../BlogList';

function BlogSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <BlogCardSkeleton key={`blogcard-skeleton-${i}`} />
      ))}
    </>
  );
}

function BlogPage() {
  return (
    <Section className='bg-white'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
        <Suspense fallback={<BlogSkeleton />}>
          <BlogList />
        </Suspense>
      </div>
    </Section>
  );
}

export default BlogPage;
