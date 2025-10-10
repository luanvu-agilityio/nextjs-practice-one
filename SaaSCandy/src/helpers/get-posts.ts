import { POSTS } from '@/constants';
import { BlogPost } from '@/types/blog-post';

export function getAllPosts(): BlogPost[] {
  return POSTS;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug);
}
