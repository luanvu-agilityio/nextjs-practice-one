import Image from 'next/image';
import Link from 'next/link';

// Components
import { Heading, Section } from '@/components/common';
import { ContentRenderer, Tags, NewsletterSignup, Share } from '@/components';

// Types
import { BlogPost } from '@/types/blog-post';

export const buildShareUrls = (post: Readonly<BlogPost>, baseHref?: string) => {
  const href =
    baseHref ?? (typeof window !== 'undefined' ? window.location.href : '');

  const encodedHref = encodeURIComponent(href);
  const encodedTitle = encodeURIComponent(post.title ?? '');

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedHref}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedHref}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedHref}`,
  };
};

const BlogPostDetailPageContent = ({ post }: { post: Readonly<BlogPost> }) => {
  return (
    <Section className='bg-white'>
      {/* Post Meta - Top */}
      <div className='flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-background mb-4 sm:mb-7'>
        <span>{post.date}</span>
        <span>{post.comments} Comments</span>
      </div>

      {/* Post Title */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-4 sm:mb-6'>
        <Heading
          as='h2'
          size='xl'
          className='font-bold text-2xl sm:text-4xl lg:text-5xl'
          content={post.title}
        />
        {post.author && (
          <div className='flex items-center gap-3 sm:gap-6 lg:w-76.5 lg:justify-end'>
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={80}
                height={80}
                className='rounded-full w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20'
              />
            )}
            <div className='flex flex-col'>
              <span className=' sm:text-lg lg:text-xl font-bold'>
                {post.author.name}
              </span>
              <span className='text-sm sm:text-xs lg:text-xl font-regular text-gray-background'>
                Author
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Featured Image */}
      {post.image && (
        <div className='mb-6 sm:mb-8'>
          <Image
            src={post.image}
            alt={post.title}
            width={1296}
            height={440}
            className='w-full object-cover rounded-2xl sm:rounded-3xl'
          />
        </div>
      )}

      <div className='flex flex-col lg:flex-row items-start gap-8 lg:gap-6'>
        <article className='flex-1 w-full lg:w-auto'>
          {/* Post Content */}
          {post.contentType === 'structured' && post.contentBlocks ? (
            <ContentRenderer
              blocks={post.contentBlocks}
              className='mb-6 sm:mb-8'
            />
          ) : (
            <div
              className='prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-6 sm:mb-8'
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          )}

          {/* Tags Section */}
          <div className='border-t pt-6 sm:pt-8 mb-6 sm:mb-8'>
            <Heading
              as='h3'
              className='text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4'
              content='Tags'
            />
            <Tags tags={post?.tags ?? []} />
          </div>

          {/* Share Section - Mobile Only */}
          <div className='border-t pt-6 sm:pt-8 mb-6 sm:mb-8 lg:hidden'>
            <Heading
              as='h3'
              className='text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4'
              content='Share'
            />
            <ul className='space-y-2'>
              <li>
                <Link
                  href={buildShareUrls(post).facebook}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm sm:text-xs text-gray-background hover:text-primary transition-colors'
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href={buildShareUrls(post).twitter}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm sm:text-xs text-gray-background hover:text-primary transition-colors'
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href={buildShareUrls(post).linkedin}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm sm:text-xs text-gray-background hover:text-primary transition-colors'
                >
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section - Mobile Only */}
          <div className='border-t pt-6 sm:pt-8 lg:hidden'>
            <NewsletterSignup />
          </div>
        </article>

        {/* Sidebar - Desktop Only */}
        <div className='hidden lg:block sticky top-4 w-104 py-12 px-11 space-y-12 shadow-form rounded-lg'>
          <Share />
          <NewsletterSignup className='w-full' />
        </div>
      </div>
    </Section>
  );
};
export { BlogPostDetailPageContent };
