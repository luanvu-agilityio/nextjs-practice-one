'use client';

import { useEffect } from 'react';
import { Button, Heading, Typography } from '@/components/common';
import Section from '@/components/common/Section';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function BlogError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Blog page error:', error);
  }, [error]);

  return (
    <Section className='bg-white min-h-[60vh] flex items-center justify-center'>
      <div className='text-center max-w-md mx-auto'>
        <div className='mb-6'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-red-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>

          <Heading
            as='h2'
            size='xl'
            content='Oops! Something went wrong'
            className='text-gray-900 mb-4'
          />

          <Typography className='text-gray-600 mb-6'>
            We encountered an error while loading the blog content. This might
            be a temporary issue with our servers.
          </Typography>
        </div>

        <div className='space-y-3'>
          <Button variant='primary' onClick={reset} className='w-full'>
            Try Again
          </Button>

          <Button
            variant='secondary'
            onClick={() => (window.location.href = '/blog')}
            className='w-full'
          >
            Back to Blog
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className='mt-6 text-left'>
            <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
              Error Details (Development)
            </summary>
            <pre className='mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto'>
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </Section>
  );
}
export default BlogError;
