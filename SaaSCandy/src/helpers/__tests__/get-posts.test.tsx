// Get Posts Tests
import {
  getPostBySlug,
  getAllPosts,
  getRecentPosts,
  getPostsByTag,
} from '@/helpers/get-posts';
import { blogService } from '@/api';
import { BlogPost } from '@/types/blog-post';

jest.mock('@/api', () => ({
  blogService: {
    getPostBySlug: jest.fn(),
    getAllPosts: jest.fn(),
    getPostsByTag: jest.fn(),
  },
}));

const mockBlogService = blogService as jest.Mocked<typeof blogService>;

const mockPost: BlogPost = {
  id: '1',
  title: 'Test Post',
  slug: 'test-post',
  excerpt: 'Test excerpt',
  content: 'Test content',
  date: '2024-01-15',
  tags: ['test'],
  author: { name: 'John Doe' },
  contentType: 'markdown',
};

describe('Get Posts Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPostBySlug', () => {
    it('should return post by slug', async () => {
      mockBlogService.getPostBySlug.mockResolvedValue(mockPost);

      const result = await getPostBySlug('test-post');

      expect(result).toEqual(mockPost);
      expect(mockBlogService.getPostBySlug).toHaveBeenCalledWith('test-post');
    });
  });

  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      mockBlogService.getAllPosts.mockResolvedValue([mockPost]);

      const result = await getAllPosts();

      expect(result).toEqual([mockPost]);
      expect(mockBlogService.getAllPosts).toHaveBeenCalled();
    });
  });

  describe('getRecentPosts', () => {
    it('should return recent posts sorted by date', async () => {
      const posts: BlogPost[] = [
        { ...mockPost, id: '1', date: '2024-01-10' },
        { ...mockPost, id: '2', date: '2024-01-20' },
        { ...mockPost, id: '3', date: '2024-01-15' },
      ];
      mockBlogService.getAllPosts.mockResolvedValue(posts);

      const result = await getRecentPosts(2);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
    });
  });

  describe('getPostsByTag', () => {
    it('should return posts filtered by tag', async () => {
      mockBlogService.getPostsByTag.mockResolvedValue([mockPost]);

      const result = await getPostsByTag('test');

      expect(result).toEqual([mockPost]);
      expect(mockBlogService.getPostsByTag).toHaveBeenCalledWith('test');
    });
  });
});
