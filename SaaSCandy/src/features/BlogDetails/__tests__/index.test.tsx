import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlogPostDetailPageContent } from '../index';
import type { BlogPost } from '@/types/blog-post';

jest.mock('@/components/ui', () => {
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

  const Heading = (props: { content?: string }) => (
    <div data-testid='heading'>{props.content}</div>
  );
  const Section = (props: { children?: React.ReactNode }) => (
    <section data-testid='section'>{props.children}</section>
  );

  return { ContentRenderer, Tags, NewsletterSignup, Share, Heading, Section };
});

describe('BlogPostDetailPage Component', () => {
  const basePost: BlogPost = {
    slug: 'test-post',
    title: 'Test Blog Post',
    excerpt: 'Test excerpt',
    content: '<p>Test content</p>',
    date: '2025-01-01',
    image: '/test.jpg',
    tags: ['javascript', 'react'],
    comments: 10,
    contentType: 'markdown',
    author: {
      name: 'John Doe',
      avatar: '/avatar.jpg',
    },
  };

  it('renders non-structured content, featured image, tags and mobile share links', () => {
    // ensure a stable href for encoding inside the component
    // assign href directly (safer than redefining the non-configurable location)
    window.location.href = 'http://localhost/test-path';

    const post: BlogPost = {
      ...basePost,
      contentType: 'markdown',
      content: '<p>HTML content</p>',
    };

    render(<BlogPostDetailPageContent post={post} />);

    // Basic meta and title
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('10 Comments')).toBeInTheDocument();

    // Featured image (uses next/image under the hood) should render an img with alt
    const featured = screen.getAllByAltText('Test Blog Post')[0];
    expect(featured).toBeTruthy();

    // Because this is non-structured we should NOT see the ContentRenderer mock
    expect(screen.queryByTestId('content-renderer')).toBeNull();

    // Tags
    expect(screen.getByTestId('tags')).toHaveTextContent('javascript,react');

    // Mobile share links should include the encoded current location
    const encoded = encodeURIComponent(window.location.href);
    const fbAnchor = screen.getByText('Facebook').closest('a');
    expect(fbAnchor).toBeTruthy();
    // href may be absolute in the test environment; check it contains the encoded url
    // (this covers the interpolation branch that uses window.location.href)
    expect(fbAnchor?.getAttribute('href') ?? '').toContain(encoded);
  });

  it('renders structured content via ContentRenderer and hides featured image when absent', () => {
    const structuredPost: BlogPost = {
      ...basePost,
      contentType: 'structured',
      // contentBlocks is the trigger for the structured branch
      // keep content empty to ensure we use structured rendering
      content: '',
      contentBlocks: [
        {
          id: 'b1',
          type: 'paragraph',
          content: { text: 'hello' },
        },
      ],
      // remove image to hit the branch where featured image is not rendered
      image: undefined,
    };

    render(<BlogPostDetailPageContent post={structuredPost} />);

    // ContentRenderer mock should render the serialized blocks
    const cr = screen.getByTestId('content-renderer');
    expect(cr).toBeInTheDocument();
    expect(cr).toHaveTextContent('hello');

    // No featured image alt for this post
    expect(screen.queryByAltText('Test Blog Post')).toBeNull();
  });

  it('renders author block even without avatar but does not render avatar image', () => {
    const postNoAvatar: BlogPost = {
      ...basePost,
      author: {
        name: 'Jane Doe',
        avatar: undefined as unknown as string | undefined,
      },
      image: undefined as unknown as string | undefined,
    };

    render(<BlogPostDetailPageContent post={postNoAvatar} />);

    // Author name should be present
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    // Avatar image should NOT be present
    expect(screen.queryByAltText('Jane Doe')).toBeNull();
  });

  it('does not render author block when author is missing', () => {
    const noAuthor = { ...basePost, author: undefined } as unknown as BlogPost;
    render(<BlogPostDetailPageContent post={noAuthor} />);

    // The author name should not be in the document
    expect(screen.queryByText('John Doe')).toBeNull();
  });

  it('renders desktop sidebar share and newsletter signup with provided className', () => {
    // render with a post that includes image and author so sidebar shows
    render(<BlogPostDetailPageContent post={basePost} />);

    // Sidebar Share mock should be present (desktop area)
    const sidebarShare = screen.getAllByTestId('share');
    expect(sidebarShare.length).toBeGreaterThanOrEqual(1);

    // There are two newsletter mocks (mobile and sidebar) — pick the sidebar one that has the className prop
    const newsletters = screen.getAllByTestId('newsletter');
    const sidebarNewsletter = newsletters.find(
      n => n.getAttribute('data-classname') === 'w-full'
    );
    expect(sidebarNewsletter).toBeTruthy();
  });
});
