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

    it('should return null if post not found', async () => {
      mockBlogService.getPostBySlug.mockResolvedValue(null);
      const result = await getPostBySlug('missing-slug');
      expect(result).toBeNull();
      expect(mockBlogService.getPostBySlug).toHaveBeenCalledWith(
        'missing-slug'
      );
    });
  });

  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      mockBlogService.getAllPosts.mockResolvedValue([mockPost]);

      const result = await getAllPosts();

      expect(result).toEqual([mockPost]);
      expect(mockBlogService.getAllPosts).toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      mockBlogService.getAllPosts.mockRejectedValue(new Error('API error'));
      const result = await getAllPosts();
      expect(result).toEqual([]);
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

    it('should use default limit when not provided', async () => {
      const posts: BlogPost[] = [
        { ...mockPost, id: '1', date: '2024-01-10' },
        { ...mockPost, id: '2', date: '2024-01-20' },
        { ...mockPost, id: '3', date: '2024-01-15' },
        { ...mockPost, id: '4', date: '2024-01-25' },
      ];
      mockBlogService.getAllPosts.mockResolvedValue(posts);
      const result = await getRecentPosts();
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('4');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    it('should return empty array if no posts', async () => {
      mockBlogService.getAllPosts.mockResolvedValue([]);
      const result = await getRecentPosts(2);
      expect(result).toEqual([]);
    });

    it('should handle invalid date format gracefully', async () => {
      const posts: BlogPost[] = [
        { ...mockPost, id: '1', date: 'invalid-date' },
        { ...mockPost, id: '2', date: '2024-01-20' },
      ];
      mockBlogService.getAllPosts.mockResolvedValue(posts);
      const result = await getRecentPosts(2);
      expect(result[0].id).toBe('1');
    });
  });

  describe('getPostsByTag', () => {
    it('should return posts filtered by tag', async () => {
      mockBlogService.getPostsByTag.mockResolvedValue([mockPost]);

      const result = await getPostsByTag('test');

      expect(result).toEqual([mockPost]);
      expect(mockBlogService.getPostsByTag).toHaveBeenCalledWith('test');
    });

    it('should return empty array if no posts match tag', async () => {
      mockBlogService.getPostsByTag.mockResolvedValue([]);
      const result = await getPostsByTag('unknown');
      expect(result).toEqual([]);
      expect(mockBlogService.getPostsByTag).toHaveBeenCalledWith('unknown');
    });
  });
});
