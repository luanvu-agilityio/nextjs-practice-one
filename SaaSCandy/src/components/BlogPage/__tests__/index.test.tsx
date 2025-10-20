import { render } from '@testing-library/react';
import BlogPage from '../index';
import { getAllPosts } from '@/helpers';

jest.mock('@/helpers');

describe('BlogPage Component', () => {
  const mockPosts = [
    {
      slug: 'post-1',
      title: 'Test Post 1',
      excerpt: 'Excerpt 1',
      date: '2025-01-01',
      image: '/test1.jpg',
      tags: ['test'],
      comments: 0,
    },
    {
      slug: 'post-2',
      title: 'Test Post 2',
      excerpt: 'Excerpt 2',
      date: '2025-01-02',
      image: '/test2.jpg',
      tags: ['test'],
      comments: 5,
    },
  ];

  beforeEach(() => {
    (getAllPosts as jest.Mock).mockResolvedValue(mockPosts);
  });

  it('matches snapshot', () => {
    const { container } = render(<BlogPage />);
    expect(container).toMatchSnapshot();
  });

  it('renders all blog posts', async () => {
    const result = await BlogPage();
    const { getByText } = render(result);

    expect(getByText('Test Post 1')).toBeInTheDocument();
    expect(getByText('Test Post 2')).toBeInTheDocument();
  });
});
