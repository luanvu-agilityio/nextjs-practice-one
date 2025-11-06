import { blogService, BlogHttpClient } from '../blog-post';
import { BlogPost } from '@/types/blog-post';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('BlogHttpClient', () => {
  it('should strip trailing slashes from baseUrl', () => {
    const client = new BlogHttpClient('https://api.com///');
    // @ts-expect-error: private access for test
    expect(client.baseUrl).toBe('https://api.com');
  });

  it('should build full URL from path', () => {
    const client = new BlogHttpClient('https://api.com');
    // @ts-expect-error: private access for test
    expect(client.buildUrl('/foo')).toBe('https://api.com/foo');
    // @ts-expect-error: private access for test
    expect(client.buildUrl('foo')).toBe('https://api.com/foo');
    // @ts-expect-error: private access for test
    expect(client.buildUrl('http://other.com/bar')).toBe(
      'http://other.com/bar'
    );
  });

  it('should make GET request and return JSON', async () => {
    const client = new BlogHttpClient('https://api.com');
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ foo: 'bar' }),
      headers: {},
    } as Response);
    const result = await client.get<{ foo: string }>('foo');
    expect(result).toEqual({ foo: 'bar' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.com/foo',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should throw error if response not ok', async () => {
    const client = new BlogHttpClient('https://api.com');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Server error',
      headers: {},
    } as Response);
    await expect(client.get('foo')).rejects.toThrow(
      'HTTP error! status: 500, message: Server error'
    );
  });

  it('should throw error if fetch throws', async () => {
    const client = new BlogHttpClient('https://api.com');
    mockFetch.mockRejectedValue(new Error('Network error'));
    await expect(client.get('foo')).rejects.toThrow('Network error');
  });
});

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
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllPosts', () => {
    it('should return all blog posts', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [mockPost],
      } as Response);

      const result = await blogService.getAllPosts();
      expect(result).toEqual([mockPost]);
    });

    it('should return empty array when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => [],
        text: async () => 'Internal Server Error',
      } as Response);

      const result = await blogService.getAllPosts();
      expect(result).toEqual([]);
    });

    it('should return empty array when response is not array', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      const result = await blogService.getAllPosts();
      expect(result).toEqual([]);
    });

    it('should catch and return empty array on thrown error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const result = await blogService.getAllPosts();
      expect(result).toEqual([]);
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
    });

    it('should return null when post not found', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await blogService.getPostBySlug('nonexistent');
      expect(result).toBeNull();
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => [],
        text: async () => 'Not Found',
      } as Response);

      await expect(blogService.getPostBySlug('test-post')).rejects.toThrow();
    });

    it('should throw error when response is not array', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await expect(blogService.getPostBySlug('test-post')).rejects.toThrow(
        'Invalid response format'
      );
    });

    it('should catch and rethrow fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      await expect(blogService.getPostBySlug('test-post')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getPostById', () => {
    it('should return post when found', async () => {
      jest.spyOn(BlogHttpClient.prototype, 'get').mockResolvedValue(mockPost);
      const result = await blogService.getPostById('1');
      expect(result).toEqual(mockPost);
    });

    it('should return null when blogHttp.get throws', async () => {
      jest
        .spyOn(BlogHttpClient.prototype, 'get')
        .mockRejectedValue(new Error('Network error'));
      const result = await blogService.getPostById('1');
      expect(result).toBeNull();
    });
  });

  describe('getPostsByTag', () => {
    it('should return posts with matching tag', async () => {
      jest.spyOn(BlogHttpClient.prototype, 'get').mockResolvedValue([mockPost]);
      const result = await blogService.getPostsByTag('test');
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('test');
    });

    it('should return empty array when no posts match', async () => {
      jest.spyOn(BlogHttpClient.prototype, 'get').mockResolvedValue([]);
      const result = await blogService.getPostsByTag('nonexistent');
      expect(result).toEqual([]);
    });

    it('should return empty array when blogHttp.get throws', async () => {
      jest
        .spyOn(BlogHttpClient.prototype, 'get')
        .mockRejectedValue(new Error('Network error'));
      const result = await blogService.getPostsByTag('test');
      expect(result).toEqual([]);
    });
  });

  describe('searchPosts', () => {
    it('should find posts by title match', async () => {
      jest.spyOn(BlogHttpClient.prototype, 'get').mockResolvedValue([mockPost]);
      const result = await blogService.searchPosts('Test');
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('Test');
    });

    it('should find posts by tag match', async () => {
      jest.spyOn(BlogHttpClient.prototype, 'get').mockResolvedValue([mockPost]);
      const result = await blogService.searchPosts('blog');
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('blog');
    });

    it('should return empty array when no matches found', async () => {
      jest.spyOn(BlogHttpClient.prototype, 'get').mockResolvedValue([]);
      const result = await blogService.searchPosts('nonexistent');
      expect(result).toEqual([]);
    });

    it('should return empty array when blogHttp.get throws', async () => {
      jest
        .spyOn(BlogHttpClient.prototype, 'get')
        .mockRejectedValue(new Error('Network error'));
      const result = await blogService.searchPosts('Test');
      expect(result).toEqual([]);
    });
  });
});
