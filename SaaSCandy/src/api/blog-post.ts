import { BlogPost } from '@/types/blog-post';

/**
 * BlogHttpClient is a lightweight HTTP client for interacting with the blog API.
 * It supports GET requests and builds URLs from a base URL and path.
 */
export class BlogHttpClient {
  private readonly baseUrl: string;

  /**
   * Creates a new BlogHttpClient instance.
   * @param baseUrl - The base URL for the blog API.
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Builds a full URL from the base URL and path.
   * @param path - The endpoint path or full URL.
   * @returns The full URL as a string.
   */
  private buildUrl(path: string) {
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }

  /**
   * Makes a GET request to the specified path.
   * @param path - The endpoint path or full URL.
   * @returns The parsed response data.
   * @throws {Error} If the response is not OK.
   */
  async get<T>(path: string): Promise<T> {
    const url = this.buildUrl(path);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

// Create blog HTTP client using the separate blog API
const BLOG_API_BASE =
  process.env.NEXT_PUBLIC_API_BLOG_POSTS ||
  'https://68d374c3214be68f8c65df1d.mockapi.io/';

const blogHttp = new BlogHttpClient(BLOG_API_BASE);

/**
 * blogService provides methods to interact with blog post resources via the blog API.
 * Includes fetching all posts, fetching by slug or ID, pagination, filtering by tag, and searching.
 */
export const blogService = {
  /**
   * Fetches all blog posts.
   * @returns An array of BlogPost objects.
   * @throws {Error} If fetching fails or response format is invalid.
   */
  getAllPosts: async (): Promise<BlogPost[]> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BLOG_POSTS}blog-posts`,
        {
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts: ${response.status}`);
      }

      const posts = await response.json();

      if (!Array.isArray(posts)) {
        throw new Error('Invalid response format');
      }

      return posts;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  },

  /**
   * Fetches a blog post by its slug.
   * @param slug - The unique slug identifier for the blog post.
   * @returns The BlogPost object if found, otherwise null.
   * @throws {Error} If fetching fails or response format is invalid.
   */
  getPostBySlug: async (slug: string): Promise<BlogPost | null> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BLOG_POSTS}blog-posts?slug=${slug}`,
        {
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch blog post: ${response.status}`);
      }

      const posts = await response.json();

      if (!Array.isArray(posts)) {
        throw new Error('Invalid response format');
      }

      return posts.length > 0 ? posts[0] : null;
    } catch (error) {
      console.error(`Error fetching blog post with slug ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Fetches a blog post by its ID.
   * @param id - The unique ID of the blog post.
   * @returns The BlogPost object if found, otherwise null.
   */
  getPostById: async (id: string): Promise<BlogPost | null> => {
    try {
      return await blogHttp.get<BlogPost>(`blog-posts/${id}`);
    } catch (error) {
      console.error(`Error fetching blog post with id ${id}:`, error);
      return null;
    }
  },

  /**
   * Fetches blog posts that match a specific tag.
   * @param tag - The tag to filter blog posts by.
   * @returns An array of BlogPost objects that contain the specified tag.
   */
  getPostsByTag: async (tag: string): Promise<BlogPost[]> => {
    try {
      const posts = await blogHttp.get<BlogPost[]>('blog-posts');
      return posts.filter(post =>
        post.tags?.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
      );
    } catch (error) {
      console.error(`Error fetching blog posts with tag ${tag}:`, error);
      return [];
    }
  },

  /**
   * Searches blog posts by a query string.
   * @param query - The search term to match against title, excerpt, or tags.
   * @returns An array of BlogPost objects matching the query.
   */
  searchPosts: async (query: string): Promise<BlogPost[]> => {
    try {
      const posts = await blogHttp.get<BlogPost[]>('blog-posts');
      const searchTerm = query.toLowerCase();

      return posts.filter(
        post =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.excerpt.toLowerCase().includes(searchTerm) ||
          post.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error(`Error searching blog posts with query ${query}:`, error);
      return [];
    }
  },
};
