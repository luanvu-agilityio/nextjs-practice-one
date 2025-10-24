import { notFound } from 'next/navigation';
import * as helpers from '@/helpers';
import BlogPostPage, { generateMetadata } from '../page';

jest.mock('@/helpers', () => ({
  getPostBySlug: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('@/components/pages', () => ({
  BlogPostPageDetailContent: () => <div>BlogPostDetailPage</div>,
}));

describe('BlogPostPage', () => {
  const params = { slug: 'test-slug' };

  it('calls notFound when post does not exist', async () => {
    (helpers.getPostBySlug as jest.Mock).mockResolvedValue(null);
    await BlogPostPage({ params });
    expect(notFound).toHaveBeenCalled();
  });
});

describe('generateMetadata', () => {
  const params = { slug: 'test-slug' };

  it('returns not found metadata if post is missing', async () => {
    (helpers.getPostBySlug as jest.Mock).mockResolvedValue(null);
    const meta = await generateMetadata({ params });
    expect(meta.title).toMatch(/Post Not Found/);
  });

  it('returns post metadata if post exists', async () => {
    (helpers.getPostBySlug as jest.Mock).mockResolvedValue({
      title: 'Test Title',
      excerpt: 'Test Excerpt',
    });
    const meta = await generateMetadata({ params });
    expect(meta.title).toMatch(/Test Title/);
    expect(meta.description).toBe('Test Excerpt');
  });
});
