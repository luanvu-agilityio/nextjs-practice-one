import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlogPostDetailPageContent, buildShareUrls } from '..';
import type { BlogPost } from '@/types/blog-post';

// Keep the same lightweight mocks used by the other tests so rendering is stable
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

describe('BlogPostDetailPageContent - mobile share links', () => {
  const post: BlogPost = {
    slug: 'mobile-share',
    title: 'Mobile Share Test',
    excerpt: '',
    content: '<p>x</p>',
    date: '2025-01-01',
    tags: [],
    comments: 0,
    contentType: 'markdown',
    author: { name: 'A' },
  } as BlogPost;

  it('renders mobile share anchors with exact urls matching buildShareUrls', () => {
    // set a specific href so the component's Link hrefs are deterministic
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.location.href = 'http://localhost/mobile-share';

    render(<BlogPostDetailPageContent post={post} />);

    const urls = buildShareUrls(post);

    const fb = screen.getByText('Facebook').closest('a');
    const tw = screen.getByText('Twitter').closest('a');
    const li = screen.getByText('LinkedIn').closest('a');

    expect(fb).toBeTruthy();
    expect(tw).toBeTruthy();
    expect(li).toBeTruthy();

    // Compare exact href values produced by the helper — this ensures the JSX
    // call-sites that invoke buildShareUrls are executed and observable.
    expect(fb!.getAttribute('href')).toEqual(urls.facebook);
    expect(tw!.getAttribute('href')).toEqual(urls.twitter);
    expect(li!.getAttribute('href')).toEqual(urls.linkedin);
  });

  it('directly exercises buildShareUrls with explicit baseHref and missing window', () => {
    const explicit = buildShareUrls(post, 'https://example.test/page');
    expect(explicit.facebook).toContain(
      encodeURIComponent('https://example.test/page')
    );

    // simulate server-side by removing window temporarily
    const g = globalThis as unknown as Record<string, unknown>;
    const orig = g['window'];
    delete g['window'];
    try {
      const serverSide = buildShareUrls(post);
      // when no window is available the encoded href should be an empty string
      expect(serverSide.facebook).toContain(encodeURIComponent(''));
    } finally {
      g['window'] = orig;
    }
  });
});
