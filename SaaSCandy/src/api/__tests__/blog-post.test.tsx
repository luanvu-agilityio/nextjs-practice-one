jest.mock('@/lib/config', () => ({
  getConfig: async () => ({
    BETTER_AUTH_SECRET: 'test-secret',
    BETTER_AUTH_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_API_BLOG_POSTS: 'https://api.com',
    SENDGRID_API_KEY: 'test-key',
    SENDGRID_FROM_EMAIL: 'test@example.com',
    TWILIO_ACCOUNT_SID: 'sid',
    TWILIO_AUTH_TOKEN: 'token',
    TWILIO_PHONE_NUMBER: '+10000000000',
    DATABASE_URL: 'postgres://local',
    POSTGRES_URL: 'postgres://local',
    GOOGLE_CLIENT_ID: 'gci',
    GOOGLE_CLIENT_SECRET: 'gcs',
    GITHUB_ID: 'gid',
    GITHUB_SECRET: 'gsecret',
  }),
}));

import { blogService, BlogHttpClient } from '../blog-post';
import { Effect } from 'effect';
import { BlogPost } from '@/types/blog-post';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

function _unwrapEffectFailure(err: unknown) {
  const maybeMsg =
    err &&
    (typeof err === 'object' && err !== null && 'message' in err
      ? err.message
      : String(err));
  if (!maybeMsg) return err;
  try {
    return JSON.parse(String(maybeMsg));
  } catch {}

  const str = String(maybeMsg);
  const first = str.indexOf('{');
  const last = str.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(str.slice(first, last + 1));
    } catch {}
  }

  return maybeMsg;
}

describe('BlogHttpClient', () => {
  it('should strip trailing slashes from baseUrl', () => {
    const client = new BlogHttpClient('https://api.com///');
    expect((client as unknown as { baseUrl: string }).baseUrl).toBe(
      'https://api.com'
    );
  });

  it('should build full URL from path', () => {
    const client = new BlogHttpClient('https://api.com');
    expect(
      (client as unknown as { buildUrl: (p: string) => string }).buildUrl(
        '/foo'
      )
    ).toBe('https://api.com/foo');
    expect(
      (client as unknown as { buildUrl: (p: string) => string }).buildUrl('foo')
    ).toBe('https://api.com/foo');
    expect(
      (client as unknown as { buildUrl: (p: string) => string }).buildUrl(
        'http://other.com/bar'
      )
    ).toBe('http://other.com/bar');
  });

  it('should make GET request and return JSON', async () => {
    const client = new BlogHttpClient('https://api.com');
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ foo: 'bar' }),
    } as unknown as Response);
    const result = (await Effect.runPromise(client.get('foo'))) as unknown as {
      foo: string;
    };
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
    try {
      await Effect.runPromise(client.get('foo'));
      throw new Error('Expected failure');
    } catch (err) {
      const payload = _unwrapEffectFailure(err);
      expect(payload).toMatchObject({ status: 500, message: 'Server error' });
    }
  });

  it('should throw error if fetch throws', async () => {
    const client = new BlogHttpClient('https://api.com');
    mockFetch.mockRejectedValue(new Error('Network error'));
    await expect(Effect.runPromise(client.get('foo'))).rejects.toThrow(
      'Network error'
    );
  });

  it('should handle timeout error (AbortError)', async () => {
    const client = new BlogHttpClient('https://api.com');
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValue(abortError);

    try {
      await Effect.runPromise(client.get('foo'));
      throw new Error('Expected failure');
    } catch (err) {
      const payload = _unwrapEffectFailure(err);
      expect(payload).toMatchObject({
        _tag: 'TimeoutError',
        message: 'Request timed out',
      });
    }
  });

  it('should handle timeout error (TimeoutError)', async () => {
    const client = new BlogHttpClient('https://api.com');
    const timeoutError = new Error('Timeout');
    timeoutError.name = 'TimeoutError';
    mockFetch.mockRejectedValue(timeoutError);

    try {
      await Effect.runPromise(client.get('foo'));
      throw new Error('Expected failure');
    } catch (err) {
      const payload = _unwrapEffectFailure(err);
      expect(payload).toMatchObject({
        _tag: 'TimeoutError',
        message: 'Request timed out',
      });
    }
  });

  it('should handle unknown error type', async () => {
    const client = new BlogHttpClient('https://api.com');
    mockFetch.mockRejectedValue('string error');

    try {
      await Effect.runPromise(client.get('foo'));
      throw new Error('Expected failure');
    } catch (err) {
      const payload = _unwrapEffectFailure(err);
      expect(payload).toMatchObject({
        status: 500,
        message: 'Unknown error occurred',
      });
    }
  });

  it('should handle response.text() failure', async () => {
    const client = new BlogHttpClient('https://api.com');
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => {
        throw new Error('Failed to read');
      },
    } as unknown as Response);

    try {
      await Effect.runPromise(client.get('foo'));
      throw new Error('Expected failure');
    } catch (err) {
      const payload = _unwrapEffectFailure(err);
      expect(payload).toMatchObject({
        status: 500,
        message: 'Failed to read response',
      });
    }
  });

  it('should handle invalid JSON response', async () => {
    const client = new BlogHttpClient('https://api.com');
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => 'not valid json',
    } as Response);

    try {
      await Effect.runPromise(client.get('foo'));
      throw new Error('Expected failure');
    } catch (err) {
      const payload = _unwrapEffectFailure(err);
      expect(payload).toMatchObject({
        _tag: 'ValidationError',
        message: 'Invalid JSON response',
      });
    }
  });

  it('should use statusText when text is empty for error response', async () => {
    const client = new BlogHttpClient('https://api.com');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => '',
    } as Response);

    try {
      await Effect.runPromise(client.get('foo'));
      throw new Error('Expected failure');
    } catch (err) {
      const payload = _unwrapEffectFailure(err);
      expect(payload).toMatchObject({ status: 404, message: 'Not Found' });
    }
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
        text: async () => JSON.stringify([mockPost]),
      } as unknown as Response);

      const result = await Effect.runPromise(blogService.getAllPostsEffect());
      expect(result).toEqual([mockPost]);
    });

    it('should return empty array when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      const result = await Effect.runPromise(blogService.getAllPostsEffect());
      expect(result).toEqual([]);
    });

    it('should return empty array when response is not array', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({}),
      } as unknown as Response);

      const result = await Effect.runPromise(blogService.getAllPostsEffect());
      expect(result).toEqual([]);
    });

    it('should catch and return empty array on thrown error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const result = await Effect.runPromise(blogService.getAllPostsEffect());
      expect(result).toEqual([]);
    });
  });

  describe('getPostBySlug', () => {
    it('should return post matching slug', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify([mockPost]),
      } as Response);

      const result = await Effect.runPromise(
        blogService.getPostBySlugEffect('test-post')
      );
      expect(result).toEqual(mockPost);
    });

    it('should return null when post not found', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify([]),
      } as Response);

      const result = await Effect.runPromise(
        blogService.getPostBySlugEffect('nonexistent')
      );
      expect(result).toBeNull();
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      } as Response);

      try {
        await Effect.runPromise(blogService.getPostBySlugEffect('test-post'));
        throw new Error('Expected failure');
      } catch (err) {
        const payload = _unwrapEffectFailure(err);
        expect(payload).toMatchObject({ status: 404, message: 'Not Found' });
      }
    });

    it('should throw error when response is not array', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({}),
      } as unknown as Response);

      try {
        await Effect.runPromise(blogService.getPostBySlugEffect('test-post'));
        throw new Error('Expected failure');
      } catch (err) {
        const payload = _unwrapEffectFailure(err);
        expect(payload).toMatchObject({
          _tag: 'ValidationError',
          message: 'Invalid response format',
        });
      }
    });

    it('should catch and rethrow fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      try {
        await blogService.getPostBySlug('test-post');
        throw new Error('Expected failure');
      } catch (err) {
        const payload = _unwrapEffectFailure(err);
        expect(payload).toMatchObject({ message: 'Network error' });
      }
    });
  });

  describe('getPostById', () => {
    it('should return post when found', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockPost),
      } as unknown as Response);
      const result = await Effect.runPromise(
        blogService.getPostByIdEffect('1')
      );
      expect(result).toEqual(mockPost);
    });

    it('should return null when blogHttp.get throws', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Network error',
      } as unknown as Response);
      const result = await Effect.runPromise(
        blogService.getPostByIdEffect('1')
      );
      expect(result).toBeNull();
    });
  });

  describe('getPostsByTag', () => {
    it('should return posts with matching tag', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify([mockPost]),
      } as unknown as Response);
      const result = (await Effect.runPromise(
        blogService.getPostsByTagEffect('test')
      )) as unknown as BlogPost[];
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('test');
    });

    it('should return empty array when no posts match', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify([]),
      } as unknown as Response);
      const result = await Effect.runPromise(
        blogService.getPostsByTagEffect('nonexistent')
      );
      expect(result).toEqual([]);
    });

    it('should return empty array when blogHttp.get throws', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Network error',
      } as unknown as Response);
      const result = await Effect.runPromise(
        blogService.getPostsByTagEffect('test')
      );
      expect(result).toEqual([]);
    });
  });

  describe('searchPosts', () => {
    it('should find posts by title match', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify([mockPost]),
      } as unknown as Response);
      const result = (await Effect.runPromise(
        blogService.searchPostsEffect('Test')
      )) as unknown as BlogPost[];
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('Test');
    });

    it('should find posts by tag match', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify([mockPost]),
      } as unknown as Response);
      const result = (await Effect.runPromise(
        blogService.searchPostsEffect('blog')
      )) as unknown as BlogPost[];
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('blog');
    });

    it('should return empty array when no matches found', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify([]),
      } as unknown as Response);
      const result = await Effect.runPromise(
        blogService.searchPostsEffect('nonexistent')
      );
      expect(result).toEqual([]);
    });

    it('should return empty array when blogHttp.get throws', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Network error',
      } as unknown as Response);
      const result = await Effect.runPromise(
        blogService.searchPostsEffect('Test')
      );
      expect(result).toEqual([]);
    });
  });

  describe('Promise-based API', () => {
    describe('getAllPosts', () => {
      it('should return all posts using Promise API', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([mockPost]),
        } as unknown as Response);

        const result = await blogService.getAllPosts();
        expect(result).toEqual([mockPost]);
      });

      it('should throw error when fetch fails', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          text: async () => 'Server error',
        } as Response);

        await expect(blogService.getAllPosts()).rejects.toThrow();
      });
    });

    describe('getPostBySlug', () => {
      it('should return post using Promise API', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([mockPost]),
        } as unknown as Response);

        const result = await blogService.getPostBySlug('test-post');
        expect(result).toEqual(mockPost);
      });

      it('should return null when post not found', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([]),
        } as unknown as Response);

        const result = await blogService.getPostBySlug('nonexistent');
        expect(result).toBeNull();
      });

      it('should return null when response is not array', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify({}),
        } as unknown as Response);

        const result = await blogService.getPostBySlug('test');
        expect(result).toBeNull();
      });
    });

    describe('getPostById', () => {
      it('should return post using Promise API', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify(mockPost),
        } as unknown as Response);

        const result = await blogService.getPostById('1');
        expect(result).toEqual(mockPost);
      });

      it('should throw error when fetch fails', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          text: async () => 'Not found',
        } as Response);

        await expect(blogService.getPostById('1')).rejects.toThrow();
      });
    });

    describe('getPostsByTag', () => {
      it('should return posts by tag using Promise API', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([mockPost]),
        } as unknown as Response);

        const result = await blogService.getPostsByTag('test');
        expect(result).toHaveLength(1);
        expect(result[0].tags).toContain('test');
      });

      it('should return empty array when no matches', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([mockPost]),
        } as unknown as Response);

        const result = await blogService.getPostsByTag('nonexistent');
        expect(result).toEqual([]);
      });
    });

    describe('searchPosts', () => {
      it('should search posts by title using Promise API', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([mockPost]),
        } as unknown as Response);

        const result = await blogService.searchPosts('Test');
        expect(result).toHaveLength(1);
        expect(result[0].title).toContain('Test');
      });

      it('should search posts by excerpt', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([mockPost]),
        } as unknown as Response);

        const result = await blogService.searchPosts('excerpt');
        expect(result).toHaveLength(1);
      });

      it('should search posts by tag', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([mockPost]),
        } as unknown as Response);

        const result = await blogService.searchPosts('blog');
        expect(result).toHaveLength(1);
        expect(result[0].tags).toContain('blog');
      });

      it('should return empty array when no matches', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([mockPost]),
        } as unknown as Response);

        const result = await blogService.searchPosts('nonexistent');
        expect(result).toEqual([]);
      });
    });
  });
});
