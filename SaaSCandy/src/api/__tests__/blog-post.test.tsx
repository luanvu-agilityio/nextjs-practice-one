import { blogService } from '../blog-post';
import { BlogPost } from '@/types/blog-post';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('blogService', () => {
  const mockPost: BlogPost = {
    id: '1',
    title: 'Test Post',
    slug: 'test-post',
    excerpt: 'Test excerpt',
    content: 'Test content',
    tags: ['test', 'blog'],

    author: { name: 'John Doe' },
    date: '',
    contentType: 'markdown',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('should return all blog posts', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [mockPost],
      } as Response);

      const result = await blogService.getAllPosts();

      expect(result).toEqual([mockPost]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(blogService.getAllPosts()).rejects.toThrow();
    });
  });

  describe('getPostBySlug', () => {
    it('should return post matching slug', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [mockPost],
      } as Response);

      const result = await blogService.getPostBySlug('test-post');

      expect(result).toEqual(mockPost);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('slug=test-post'),
        expect.objectContaining({ signal: expect.anything() })
      );
    });

    it('should return null when post not found', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await blogService.getPostBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getPostsByTag', () => {
    it('should return posts with matching tag', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [mockPost, { ...mockPost, id: '2', tags: ['other'] }],
      } as Response);

      const result = await blogService.getPostsByTag('test');

      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('test');
    });

    it('should return empty array when no posts match', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [mockPost],
      } as Response);

      const result = await blogService.getPostsByTag('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('searchPosts', () => {
    it('should find posts by title match', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [mockPost],
      } as Response);

      const result = await blogService.searchPosts('Test');

      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('Test');
    });

    it('should return empty array when no matches found', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [mockPost],
      } as Response);

      const result = await blogService.searchPosts('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
