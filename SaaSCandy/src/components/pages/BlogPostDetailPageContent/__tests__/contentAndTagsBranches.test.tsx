import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlogPostDetailPageContent } from '../index';
import type { BlogPost } from '@/types/blog-post';

// Reuse the lightweight child mocks pattern so we can assert tags and content
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

describe('BlogPostDetailPageContent - empty content / missing tags branches', () => {
  const basePost: BlogPost = {
    slug: 't',
    title: 'T',
    excerpt: '',
    content: undefined as unknown as string | undefined,
    date: '2025-01-01',
    image: undefined as unknown as string | undefined,
    tags: undefined as unknown as string[] | undefined,
    comments: 0,
    contentType: 'markdown',
    author: undefined as unknown as { name?: string } | undefined,
  } as unknown as BlogPost;

  it('renders an empty dangerouslySetInnerHTML container when content is missing and tags default to []', () => {
    const { container } = render(<BlogPostDetailPageContent post={basePost} />);

    // The prose container should exist but be empty string when post.content is falsy
    const prose = container.querySelector('.prose');
    expect(prose).toBeTruthy();
    expect(prose?.innerHTML).toBe('');

    // Tags mock should receive the default empty array and render empty text
    const tags = screen.getByTestId('tags');
    expect(tags).toBeInTheDocument();
    expect(tags).toHaveTextContent('');
  });
});
