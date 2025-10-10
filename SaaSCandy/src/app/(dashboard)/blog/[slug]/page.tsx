import BlogPostDetailPage from '@/components/BlogPostDetailPage';
import { getPostBySlug } from '@/helpers';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}
export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found | SaaSCandy',
    };
  }

  return {
    title: `${post.title} | SaaSCandy`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPostDetailPage post={post} />;
}
