import { Section } from '@/components/common';

const BlogListLoading = () => {
  return (
    <Section className='bg-white'>
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className='group animate-pulse'>
            <div className='block rounded-lg overflow-hidden bg-white'>
              {/* Loading image - matches BlogCard image structure */}
              <div className='w-full h-[284px] bg-gray-200'></div>

              {/* Loading content - matches BlogCard structure */}
              <div className='flex flex-col gap-4 py-10'>
                {/* Loading title - matches Heading structure */}
                <div className='space-y-2'>
                  <div className='h-6 bg-gray-200 rounded w-full'></div>
                  <div className='h-6 bg-gray-200 rounded w-3/4'></div>
                </div>

                {/* Loading date - matches the date structure */}
                <div className='h-3 bg-gray-200 rounded w-20'></div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
};

export default BlogListLoading;
