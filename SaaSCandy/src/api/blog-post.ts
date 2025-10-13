import { BlogPost } from '@/types/blog-post';

class BlogHttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private buildUrl(path: string) {
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }

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

export const blogService = {
  // Get all blog posts
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
      // TODO: handle error properly
      throw error;
    }
  },

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

  // Get blog post by ID
  getPostById: async (id: string): Promise<BlogPost | null> => {
    try {
      return await blogHttp.get<BlogPost>(`blog-posts/${id}`);
    } catch (error) {
      console.error(`Error fetching blog post with id ${id}:`, error);
      return null;
    }
  },

  // Get paginated posts
  getPaginatedPosts: async (
    page: number = 1,
    limit: number = 6
  ): Promise<{
    posts: BlogPost[];
    total: number;
    hasMore: boolean;
  }> => {
    try {
      const posts = await blogHttp.get<BlogPost[]>(
        `blog-posts?page=${page}&limit=${limit}`
      );

      // MockAPI doesn't return total count, so we need to get all posts to calculate
      const allPosts = await blogHttp.get<BlogPost[]>('blog-posts');
      const total = allPosts.length;
      const hasMore = page * limit < total;

      return {
        posts,
        total,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching paginated blog posts:', error);
      return {
        posts: [],
        total: 0,
        hasMore: false,
      };
    }
  },

  // Get posts by tag
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

  // Search posts
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
