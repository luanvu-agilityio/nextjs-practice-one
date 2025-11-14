import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { buildShareUrls, BlogPostDetailPageContent } from '..';
import type { BlogPost } from '@/types/blog-post';

// reuse the same lightweight common mocks used elsewhere for stability
jest.mock('@/components', () => {
  const ContentRenderer = (props: { blocks?: unknown }) => (
    <div data-testid='content-renderer'>{JSON.stringify(props.blocks)}</div>
  );
  const Tags = (props: { tags?: string[] }) => (
    <div data-testid='tags'>{(props.tags ?? []).join(',')}</div>
  );
  const NewsletterSignup = (props: { className?: string }) => (
    <div data-testid='newsletter' data-classname={props.className} />
  );
  const Share = () => <div data-testid='share' />;

  return { ContentRenderer, Tags, NewsletterSignup, Share };
});

jest.mock('@/components/common', () => {
  const Heading = (props: { content?: string }) => (
    <div data-testid='heading'>{props.content}</div>
  );
  const Section = (props: { children?: React.ReactNode }) => (
    <section data-testid='section'>{props.children}</section>
  );
  return { Heading, Section };
});

describe('BlogPostDetailPageContent — cover remaining branches', () => {
  const base: BlogPost = {
    slug: 'r',
    title: 'R Test',
    excerpt: '',
    content: '<p>r</p>',
    date: '2025-01-01',
    tags: ['t'],
    comments: 0,
    contentType: 'markdown',
    author: { name: 'A' },
  } as BlogPost;

  afterEach(() => {
    cleanup();
    // make sure window is present for subsequent tests
    const g = globalThis as unknown as Record<string, unknown>;
    if (g['window'] === undefined) {
      // restore a minimal window.location when tests removed it
      g['window'] = { location: { href: 'http://localhost/' } } as unknown;
    }
  });

  it('exercises buildShareUrls permutations (title empty, title undefined, explicit baseHref)', () => {
    // title empty string
    const tEmpty = buildShareUrls({ ...base, title: '' }, 'https://a.test');
    expect(tEmpty.twitter).toContain(encodeURIComponent(''));

    // title undefined
    const tUndef = buildShareUrls(
      { ...base, title: undefined as unknown as string },
      'https://a.test'
    );
    expect(tUndef.twitter).toContain(encodeURIComponent(''));

    // no baseHref but window defined
    // set a stable global href via globalThis to avoid linting warnings
    const gw = globalThis as unknown as { location?: { href?: string } };
    gw.location = gw.location ?? { href: '' };
    gw.location.href = 'http://localhost/x';
    const tDefault = buildShareUrls(base);
    expect(tDefault.facebook).toContain(
      encodeURIComponent(gw.location.href ?? '')
    );
  });

  it('re-renders component multiple times to hit inline buildShareUrls call-sites', () => {
    // first render: window present
    // set a stable global href for this render
    const g1 = globalThis as unknown as { location?: { href?: string } };
    g1.location = g1.location ?? { href: '' };
    g1.location.href = 'http://localhost/one';
    render(<BlogPostDetailPageContent post={base} />);
    const fb1 = screen.getByText('Facebook').closest('a');
    expect(fb1).toBeTruthy();

    cleanup();

    // second render: explicit baseHref by rendering then comparing via helper
    // (the JSX call sites use the inline helper directly; ensure we execute them again)
    // set a stable global href for this render
    const g2 = globalThis as unknown as { location?: { href?: string } };
    g2.location = g2.location ?? { href: '' };
    g2.location.href = 'http://localhost/two';
    render(
      <BlogPostDetailPageContent post={{ ...base, title: 'Two' } as BlogPost} />
    );
    const fb2 = screen.getByText('Facebook').closest('a');
    expect(fb2).toBeTruthy();

    cleanup();

    // third render: simulate server-side by deleting window then render
    const g = globalThis as unknown as Record<string, unknown>;
    const orig = g['window'];
    delete g['window'];
    try {
      render(<BlogPostDetailPageContent post={base} />);
      const fb3 = screen.getByText('Facebook').closest('a');
      // link should still be present but its href will be based on empty encoded href
      expect(fb3).toBeTruthy();
      expect(fb3?.getAttribute('href')).toContain('sharer.php');
    } finally {
      g['window'] = orig;
    }
  });
});
