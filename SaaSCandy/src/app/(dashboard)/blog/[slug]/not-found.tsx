import Link from 'next/link';

// Components
import { Button, Heading, Typography, Section } from '@/components/ui';

const BlogPostNotFound = () => {
  return (
    <Section className='bg-white min-h-[60vh] flex items-center justify-center'>
      <div className='text-center max-w-md mx-auto'>
        <div className='mb-6'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>

          <Heading
            as='h2'
            size='xl'
            content='Blog Post Not Found'
            className='text-primary mb-4'
          />

          <Typography className='text-gray-background mb-6'>
            The blog post you&apos;re looking for doesn&apos;t exist or may have
            been moved. Let&apos;s get you back to reading great content!
          </Typography>
        </div>

        <div className='space-y-3'>
          <Link href='/blog' className='block'>
            <Button variant='primary' className='w-full'>
              Browse All Posts
            </Button>
          </Link>

          <Link href='/' className='block'>
            <Button variant='secondary' className='w-full'>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
};
export default BlogPostNotFound;
