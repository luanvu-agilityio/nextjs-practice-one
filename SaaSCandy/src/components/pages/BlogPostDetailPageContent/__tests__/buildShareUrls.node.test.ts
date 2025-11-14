/** @jest-environment node */
import { buildShareUrls } from '../index';
import type { BlogPost } from '@/types/blog-post';

describe('buildShareUrls (node env - no window)', () => {
  const minimalPost = {
    slug: 'p',
    title: 'Node Test',
    excerpt: '',
    content: '',
    date: '2025-01-01',
    comments: 0,
    contentType: 'markdown',
  } as unknown as BlogPost;

  it('returns share URLs that tolerate missing window (empty href)', () => {
    const urls = buildShareUrls(minimalPost);

    // When no window/baseHref exists the encoded href is empty string —
    // the produced URLs should still contain the expected query keys.
    expect(urls.facebook).toContain('?u=');
    expect(urls.twitter).toContain('?url=');
    expect(urls.twitter).toContain('text=');
    expect(urls.linkedin).toContain('url=');
  });

  it('handles a missing title by encoding an empty text param', () => {
    const postNoTitle = {
      ...minimalPost,
      title: undefined,
    } as unknown as BlogPost;
    const urls = buildShareUrls(postNoTitle);

    // twitter text param should be present (possibly empty)
    expect(urls.twitter).toContain('text=');
  });
});
