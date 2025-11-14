import { buildShareUrls } from '../index';

import type { BlogPost } from '@/types/blog-post';

describe('buildShareUrls', () => {
  const post: BlogPost = {
    slug: 's',
    title: 'Hello World',
    excerpt: '',
    content: '',
    date: '',
    tags: [],
    comments: 0,
    contentType: 'markdown',
    author: { name: 'A' },
  } as BlogPost;

  it('builds urls using provided baseHref', () => {
    const urls = buildShareUrls(post, 'https://example.com/page');
    expect(urls.facebook).toContain(
      encodeURIComponent('https://example.com/page')
    );
    expect(urls.twitter).toContain(
      encodeURIComponent('https://example.com/page')
    );
    expect(urls.twitter).toContain(encodeURIComponent(post.title));
    expect(urls.linkedin).toContain(
      encodeURIComponent('https://example.com/page')
    );
  });

  it('builds urls using empty href when none and window undefined', () => {
    const urls = buildShareUrls(post, '');
    expect(urls.facebook).toContain(encodeURIComponent(''));
    expect(urls.twitter).toContain(encodeURIComponent(''));
    expect(urls.twitter).toContain(encodeURIComponent(post.title));
  });

  it('defaults to using window.location.href when baseHref not provided', () => {
    // Do not assign to window.location.href to avoid JSDOM navigation warnings.
    const urls = buildShareUrls(post);
    // Expect the encoded href to be based on the JSDOM window location by default
    type G = { location?: { href?: string } };
    const g = globalThis as unknown as G;
    const expected = encodeURIComponent(g.location?.href ?? '');
    expect(urls.facebook).toContain(expected);
    expect(urls.twitter).toContain(expected);
    expect(urls.linkedin).toContain(expected);
  });

  it('handles missing post.title by encoding empty string', () => {
    const p = { ...post, title: undefined } as unknown as BlogPost;
    const urls = buildShareUrls(p, 'https://example.com');
    // the twitter text param should include empty encoded title
    expect(urls.twitter).toContain(encodeURIComponent(''));
  });

  it('uses empty href when window is not available (server-side)', () => {
    const g = globalThis as unknown as Record<string, unknown>;
    const orig = g['window'];
    delete g['window'];
    try {
      const urls = buildShareUrls(post);
      expect(urls.facebook).toContain(encodeURIComponent(''));
      expect(urls.twitter).toContain(encodeURIComponent(''));
      expect(urls.linkedin).toContain(encodeURIComponent(''));
    } finally {
      g['window'] = orig;
    }
  });
});
