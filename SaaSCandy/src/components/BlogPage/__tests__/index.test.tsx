import { render } from '@testing-library/react';
import BlogPage from '../index';
import { getAllPosts } from '@/helpers';

jest.mock('@/helpers');
jest.mock('../../BlogList', () => {
  const MockedBlogList = () => <div>Mocked BlogList</div>;
  MockedBlogList.displayName = 'MockedBlogList';
  return MockedBlogList;
});

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
});
