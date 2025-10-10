import Image from 'next/image';
import Link from 'next/link';

// Components
import { Heading } from '../common';
import Section from '../common/Section';
import { Tags } from '../Tags';
import { NewsletterSignup } from '../NewsletterSignup';
import { Share } from '../Share';
import { ContentRenderer } from '../ContentRenderer';

// Types
import { BlogPost } from '@/types/blog-post';

function BlogPostDetailPage({ post }: { post: Readonly<BlogPost> }) {
  return (
    <Section className='bg-white'>
      {/* Post Meta - Top */}
      <div className='flex items-center gap-4 text-sm text-gray-background mb-7'>
        <span>{post.date}</span>
        <span>{post.comments} Comments</span>
      </div>

      {/* Post Title */}
      <div className='flex items-center justify-between gap-6 mb-6'>
        <Heading as='h2' size='xl' className='font-bold' content={post.title} />
        {post.author && (
          <div className='flex items-center justify-end gap-6 w-76.5'>
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={80}
                height={80}
                className='rounded-full'
              />
            )}
            <div className='flex flex-col'>
              <span className='text-xl font-bold '>{post.author.name}</span>
              <span className='text-xl font-regular'>Author</span>
            </div>
          </div>
        )}
      </div>
      {/* Featured Image */}
      {post.image && (
        <div className='mb-8'>
          <Image
            src={post.image}
            alt={post.title}
            width={1296}
            height={440}
            className='w-full  object-cover rounded-3xl'
          />
        </div>
      )}
      <div className='flex items-start justify-between gap-6'>
        <article className='flex-1'>
          {/* Post Content */}
          {post.contentType === 'structured' && post.contentBlocks ? (
            <ContentRenderer blocks={post.contentBlocks} className='mb-8' />
          ) : (
            <div
              className='prose prose-lg max-w-none mb-8'
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          )}

          {/* Tags Section */}
          <div className='border-t pt-8 mb-8'>
            <Heading
              as='h3'
              className='text-2xl font-bold text-gray-900 mb-4'
              content='Tags'
            />
            <Tags tags={post?.tags ?? []} />
          </div>

          {/* Share Section */}
          <div className='border-t pt-8 mb-8'>
            <Heading
              as='h3'
              className='text-2xl font-bold text-gray-900 mb-4'
              content='Share'
            />
            <ul className='space-y-2'>
              <li>
                <Link
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(post.title)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className='border-t pt-8'>
            <NewsletterSignup />
          </div>
        </article>
        {/* Sidebar */}
        <div className='sticky w-104 py-12 px-11 space-y-12 shadow-form rounded-lg '>
          <Share />
          <NewsletterSignup className='w-full' />
        </div>
      </div>
    </Section>
  );
}
export default BlogPostDetailPage;
