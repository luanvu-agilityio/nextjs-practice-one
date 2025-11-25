import { Effect, pipe } from 'effect';
import { AppConfig, getConfig } from '@/lib/config';
import { BlogPost } from '@/types/blog-post';

class HttpError {
  readonly _tag = 'HttpError';
  constructor(
    readonly status: number,
    readonly message: string,
    readonly data?: unknown
  ) {}
}

class ValidationError {
  readonly _tag = 'ValidationError';
  constructor(readonly message: string) {}
}

class TimeoutError {
  readonly _tag = 'TimeoutError';
  constructor(readonly message: string = 'Request timed out') {}
}

type BlogError = HttpError | ValidationError | TimeoutError;

export class BlogHttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }

  /**
   * Makes a GET request using Effect.
   * Returns an Effect that yields the response data or fails with BlogError.
   */
  get<T>(path: string): Effect.Effect<T, BlogError, never> {
    const url = this.buildUrl(path);

    const fetchEffect = Effect.tryPromise({
      try: (): Promise<Response> =>
        fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        }),
      catch: (error): BlogError => {
        if (error instanceof Error) {
          if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            return new TimeoutError();
          }
          return new HttpError(500, error.message);
        }
        return new HttpError(500, 'Unknown error occurred');
      },
    });

    const parseEffect = (
      response: Response
    ): Effect.Effect<T, BlogError, never> => {
      const textEffect = Effect.tryPromise({
        try: (): Promise<string> => response.text(),
        catch: (): BlogError => new HttpError(500, 'Failed to read response'),
      });

      return pipe(
        textEffect,
        Effect.flatMap((text): Effect.Effect<T, BlogError, never> => {
          if (!response.ok) {
            return Effect.fail(
              new HttpError(response.status, text || response.statusText)
            );
          }

          try {
            const data = JSON.parse(text);
            return Effect.succeed(data as T);
          } catch {
            return Effect.fail(new ValidationError('Invalid JSON response'));
          }
        })
      );
    };

    return pipe(fetchEffect, Effect.flatMap(parseEffect));
  }
}

// Helper: build BlogHttpClient from AppConfig
const makeBlogHttp = (cfg: AppConfig) =>
  new BlogHttpClient(cfg.NEXT_PUBLIC_API_BLOG_POSTS);

/**
 * Fetches all blog posts.
 * Returns an Effect that yields BlogPost[] or fails with BlogError.
 */
const getAllPostsEffect = () =>
  pipe(
    Effect.tryPromise({ try: () => getConfig(), catch: e => e as Error }),
    Effect.flatMap(cfg => makeBlogHttp(cfg).get<BlogPost[]>('blog-posts')),
    Effect.flatMap(posts =>
      Array.isArray(posts)
        ? Effect.succeed(posts)
        : Effect.fail(new ValidationError('Invalid response format'))
    ),
    Effect.retry({ times: 1 }), // Retry once on failure
    Effect.catchAll(error => {
      console.error('Error fetching blog posts:', error);
      return Effect.succeed([] as BlogPost[]);
    })
  );

/**
 * Fetches a blog post by slug.
 * Returns an Effect that yields BlogPost | null or fails with BlogError.
 */
const getPostBySlugEffect = (slug: string) =>
  pipe(
    Effect.tryPromise({ try: () => getConfig(), catch: e => e as Error }),
    Effect.flatMap(cfg =>
      makeBlogHttp(cfg).get<BlogPost[]>(`blog-posts?slug=${slug}`)
    ),
    Effect.flatMap(posts =>
      Array.isArray(posts)
        ? Effect.succeed(posts.length > 0 ? posts[0] : null)
        : Effect.fail(new ValidationError('Invalid response format'))
    ),
    Effect.retry({ times: 1 }),
    Effect.catchAll(error => {
      console.error(`Error fetching blog post with slug ${slug}:`, error);
      return Effect.fail(error);
    })
  );

/**
 * Fetches a blog post by ID.
 * Returns an Effect that yields BlogPost | null.
 */
const getPostByIdEffect = (id: string) =>
  pipe(
    Effect.tryPromise({ try: () => getConfig(), catch: e => e as Error }),
    Effect.flatMap(cfg => makeBlogHttp(cfg).get<BlogPost>(`blog-posts/${id}`)),
    Effect.map(post => post as BlogPost | null),
    Effect.catchAll(error => {
      console.error(`Error fetching blog post with id ${id}:`, error);
      return Effect.succeed(null);
    })
  );

/**
 * Fetches blog posts by tag.
 * Returns an Effect that yields BlogPost[].
 */
const getPostsByTagEffect = (tag: string) =>
  pipe(
    Effect.tryPromise({ try: () => getConfig(), catch: e => e as Error }),
    Effect.flatMap(cfg => makeBlogHttp(cfg).get<BlogPost[]>('blog-posts')),
    Effect.map(posts =>
      posts.filter(post =>
        post.tags?.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
      )
    ),
    Effect.catchAll(error => {
      console.error(`Error fetching blog posts with tag ${tag}:`, error);
      return Effect.succeed([]);
    })
  );

/**
 * Searches blog posts by query.
 * Returns an Effect that yields BlogPost[].
 */
const searchPostsEffect = (query: string) =>
  pipe(
    Effect.tryPromise({ try: () => getConfig(), catch: e => e as Error }),
    Effect.flatMap(cfg => makeBlogHttp(cfg).get<BlogPost[]>('blog-posts')),
    Effect.map(posts => {
      const searchTerm = query.toLowerCase();
      return posts.filter(
        post =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.excerpt.toLowerCase().includes(searchTerm) ||
          post.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }),
    Effect.catchAll(error => {
      console.error(`Error searching blog posts with query ${query}:`, error);
      return Effect.succeed([]);
    })
  );

export const blogService = {
  getAllPostsEffect,
  getPostBySlugEffect,
  getPostByIdEffect,
  getPostsByTagEffect,
  searchPostsEffect,

  // Promise-based API (use Effects; avoid async/await by running Effects)
  getAllPosts: (): Promise<BlogPost[]> => {
    return Effect.runPromise(
      pipe(
        Effect.tryPromise({ try: () => getConfig(), catch: e => e as Error }),
        Effect.flatMap(cfg => makeBlogHttp(cfg).get<BlogPost[]>('blog-posts'))
      )
    );
  },

  getPostBySlug: (slug: string): Promise<BlogPost | null> => {
    return Effect.runPromise(
      pipe(
        Effect.tryPromise({ try: () => getConfig(), catch: e => e as Error }),
        Effect.flatMap(cfg =>
          makeBlogHttp(cfg).get<BlogPost[]>(`blog-posts?slug=${slug}`)
        ),
        Effect.map(posts =>
          Array.isArray(posts) ? (posts.length > 0 ? posts[0] : null) : null
        )
      )
    );
  },

  getPostById: (id: string): Promise<BlogPost | null> => {
    return Effect.runPromise(
      pipe(
        Effect.tryPromise({ try: () => getConfig(), catch: e => e as Error }),
        Effect.flatMap(cfg =>
          makeBlogHttp(cfg).get<BlogPost>(`blog-posts/${id}`)
        )
      )
    );
  },

  getPostsByTag: (tag: string): Promise<BlogPost[]> => {
    return Effect.runPromise(
      pipe(
        Effect.tryPromise({ try: () => getConfig(), catch: e => e as Error }),
        Effect.flatMap(cfg => makeBlogHttp(cfg).get<BlogPost[]>('blog-posts')),
        Effect.map(posts =>
          posts.filter(post =>
            post.tags?.some(
              postTag => postTag.toLowerCase() === tag.toLowerCase()
            )
          )
        )
      )
    );
  },

  searchPosts: (query: string): Promise<BlogPost[]> => {
    return Effect.runPromise(
      pipe(
        Effect.tryPromise({ try: () => getConfig(), catch: e => e as Error }),
        Effect.flatMap(cfg => makeBlogHttp(cfg).get<BlogPost[]>('blog-posts')),
        Effect.map(posts => {
          const searchTerm = query.toLowerCase();
          return posts.filter(
            post =>
              post.title.toLowerCase().includes(searchTerm) ||
              post.excerpt.toLowerCase().includes(searchTerm) ||
              post.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        })
      )
    );
  },
};
