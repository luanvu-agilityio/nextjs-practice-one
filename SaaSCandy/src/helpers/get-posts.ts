import { blogService } from '@/api';
import { BlogPost } from '@/types/blog-post';

/**
 * Fetches a single blog post by its slug.
 * @param slug - The unique identifier for the blog post.
 * @returns The blog post object if found, otherwise null.
 */
export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  return await blogService.getPostBySlug(slug);
};

/**
 * Fetches all blog posts.
 * @returns An array of all blog post objects.
 * If fetching fails, returns an empty array and logs the error.
 */
export const getAllPosts = async (): Promise<BlogPost[]> => {
  try {
    return await blogService.getAllPosts();
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
};

/**
 * Fetches the most recent blog posts, sorted by date (descending).
 * @param limit - The maximum number of posts to return (default: 3).
 * @returns An array of the most recent blog post objects.
 */
export const getRecentPosts = async (
  limit: number = 3
): Promise<BlogPost[]> => {
  const posts = await blogService.getAllPosts();
  return posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

/**
 * Fetches blog posts that match a specific tag.
 * @param tag - The tag to filter blog posts by.
 * @returns An array of blog post objects that contain the specified tag.
 */
export const getPostsByTag = async (tag: string): Promise<BlogPost[]> => {
  return await blogService.getPostsByTag(tag);
};
