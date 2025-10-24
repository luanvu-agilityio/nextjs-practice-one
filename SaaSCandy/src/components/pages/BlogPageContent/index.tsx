import { Suspense } from 'react';

// Components
import { BlogCardSkeleton, BlogList } from '@/components';
import { Section } from '@/components/common';

const BlogSkeleton = () => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <BlogCardSkeleton key={`blogcard-skeleton-${i}`} />
      ))}
    </>
  );
};

const BlogPageContent = () => {
  return (
    <Section className='bg-white'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
        <Suspense fallback={<BlogSkeleton />}>
          <BlogList />
        </Suspense>
      </div>
    </Section>
  );
};
BlogPageContent.displayName = 'BlogPageContent';
export { BlogPageContent };
