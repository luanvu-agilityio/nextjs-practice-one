import Section from '@/components/common/Section';

function BlogDetailLoading() {
  return (
    <Section className='bg-white'>
      <div className='animate-pulse'>
        {/* Loading Post Meta - matches the actual meta structure */}
        <div className='flex items-center gap-4 text-sm mb-7'>
          <div className='h-4 bg-gray-200 rounded w-20'></div>
          <div className='h-4 bg-gray-200 rounded w-24'></div>
        </div>

        {/* Loading Title and Author - matches the flex layout */}
        <div className='flex items-center justify-between gap-6 mb-6'>
          {/* Loading title */}
          <div className='flex-1'>
            <div className='h-8 bg-gray-200 rounded w-full mb-2'></div>
            <div className='h-8 bg-gray-200 rounded w-3/4'></div>
          </div>

          {/* Loading author - matches the author section */}
          <div className='flex items-center justify-end gap-6 w-76.5'>
            <div className='w-20 h-20 bg-gray-200 rounded-full'></div>
            <div className='flex flex-col'>
              <div className='h-6 bg-gray-200 rounded w-24 mb-1'></div>
              <div className='h-6 bg-gray-200 rounded w-16'></div>
            </div>
          </div>
        </div>

        {/* Loading Featured Image - matches the image structure */}
        <div className='mb-8'>
          <div className='w-full h-[440px] bg-gray-200 rounded-3xl'></div>
        </div>

        {/* Loading Main Content Layout - matches the flex structure */}
        <div className='flex items-start justify-between gap-6'>
          {/* Loading Article Content */}
          <article className='flex-1'>
            {/* Loading content blocks */}
            <div className='mb-8 space-y-6'>
              {/* Loading heading */}
              <div className='h-8 bg-gray-200 rounded w-2/3'></div>

              {/* Loading paragraphs */}
              <div className='space-y-4'>
                <div className='h-4 bg-gray-200 rounded w-full'></div>
                <div className='h-4 bg-gray-200 rounded w-11/12'></div>
                <div className='h-4 bg-gray-200 rounded w-full'></div>
                <div className='h-4 bg-gray-200 rounded w-5/6'></div>
              </div>

              {/* Loading list items */}
              <div className='space-y-3'>
                <div className='flex items-start gap-2'>
                  <div className='w-2 h-2 bg-gray-200 rounded-full mt-2'></div>
                  <div className='h-4 bg-gray-200 rounded flex-1'></div>
                </div>
                <div className='flex items-start gap-2'>
                  <div className='w-2 h-2 bg-gray-200 rounded-full mt-2'></div>
                  <div className='h-4 bg-gray-200 rounded flex-1'></div>
                </div>
                <div className='flex items-start gap-2'>
                  <div className='w-2 h-2 bg-gray-200 rounded-full mt-2'></div>
                  <div className='h-4 bg-gray-200 rounded flex-1'></div>
                </div>
              </div>

              {/* More loading paragraphs */}
              <div className='space-y-4'>
                <div className='h-4 bg-gray-200 rounded w-full'></div>
                <div className='h-4 bg-gray-200 rounded w-4/5'></div>
                <div className='h-4 bg-gray-200 rounded w-full'></div>
              </div>
            </div>

            {/* Loading Tags Section - matches the border-t structure */}
            <div className='border-t pt-8 mb-8'>
              <div className='h-7 bg-gray-200 rounded w-16 mb-4'></div>
              <div className='flex flex-wrap gap-2'>
                <div className='h-6 bg-gray-200 rounded-full w-16'></div>
                <div className='h-6 bg-gray-200 rounded-full w-14'></div>
                <div className='h-6 bg-gray-200 rounded-full w-20'></div>
              </div>
            </div>

            {/* Loading Share Section - matches the border-t structure */}
            <div className='border-t pt-8 mb-8'>
              <div className='h-7 bg-gray-200 rounded w-16 mb-4'></div>
              <ul className='space-y-2'>
                <li>
                  <div className='h-5 bg-gray-200 rounded w-20'></div>
                </li>
                <li>
                  <div className='h-5 bg-gray-200 rounded w-16'></div>
                </li>
                <li>
                  <div className='h-5 bg-gray-200 rounded w-18'></div>
                </li>
              </ul>
            </div>

            {/* Loading Newsletter Section - matches the border-t structure */}
            <div className='border-t pt-8'>
              <div className='h-10 bg-gray-200 rounded w-48 mb-4'></div>
              <div className='space-y-4'>
                <div className='h-12 bg-gray-200 rounded'></div>
                <div className='h-12 bg-gray-200 rounded w-32'></div>
              </div>
            </div>
          </article>

          {/* Loading Sidebar - matches the sticky sidebar structure */}
          <div className='sticky w-104 py-12 px-11 space-y-12 shadow-form rounded-lg'>
            {/* Loading Share component */}
            <div className='space-y-3'>
              <div className='h-10 bg-gray-200 rounded w-16 mb-4'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
            </div>

            {/* Loading Newsletter Signup component */}
            <div>
              <div className='h-10 bg-gray-200 rounded w-48 mb-4'></div>
              <div className='space-y-4'>
                <div className='h-12 bg-gray-200 rounded'></div>
                <div className='h-12 bg-gray-200 rounded'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default BlogDetailLoading;
