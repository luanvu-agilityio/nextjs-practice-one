// Components
import Section from '../common/Section';
import { BlogCard, BlogCardSkeleton } from '../BlogCard';
import React, { Suspense } from 'react';

// Helper
import { getAllPosts } from '@/helpers';

async function BlogList() {
  const posts = await getAllPosts();
  return (
    <>
      {posts.map(p => (
        <BlogCard key={p.slug} {...p} />
      ))}
    </>
  );
}

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
