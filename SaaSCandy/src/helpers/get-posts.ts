import { blogService } from '@/api';
import { BlogPost } from '@/types/blog-post';

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  return await blogService.getPostBySlug(slug);
};

export const getAllPosts = async (): Promise<BlogPost[]> => {
  return await blogService.getAllPosts();
};

export const getRecentPosts = async (
  limit: number = 3
): Promise<BlogPost[]> => {
  const posts = await blogService.getAllPosts();
  return posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getPostsByTag = async (tag: string): Promise<BlogPost[]> => {
  return await blogService.getPostsByTag(tag);
};
