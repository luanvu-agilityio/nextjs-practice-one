import React from 'react';
import BlogPostNotFound from '@/app/(dashboard)/blog/[slug]/not-found';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('BlogPostNotFound - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<BlogPostNotFound />);
    expect(container).toMatchSnapshot();
  });

  it('should render not found message', () => {
    render(<BlogPostNotFound />);

    expect(screen.getByText('Blog Post Not Found')).toBeInTheDocument();
    expect(
      screen.getByText(/The blog post you're looking for doesn't exist/)
    ).toBeInTheDocument();
  });

  it('should render navigation buttons with correct links', () => {
    render(<BlogPostNotFound />);

    const browsePostsLink = screen.getByText('Browse All Posts').closest('a');
    const homeLink = screen.getByText('Back to Home').closest('a');

    expect(browsePostsLink).toHaveAttribute('href', '/blog');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render icon svg', () => {
    const { container } = render(<BlogPostNotFound />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-gray-400');
  });
});
