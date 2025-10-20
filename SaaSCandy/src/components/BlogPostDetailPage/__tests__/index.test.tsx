import { render } from '@testing-library/react';
import BlogPostDetailPage from '../index';
import { BlogPost } from '@/types/blog-post';

describe('BlogPostDetailPage Component', () => {
  const mockPost: BlogPost = {
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

  it('matches snapshot', () => {
    const { container } = render(<BlogPostDetailPage post={mockPost} />);
    expect(container).toMatchSnapshot();
  });

  it('renders post title and author', () => {
    const { getByText } = render(<BlogPostDetailPage post={mockPost} />);

    expect(getByText('Test Blog Post')).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('10 Comments')).toBeInTheDocument();
  });
});
