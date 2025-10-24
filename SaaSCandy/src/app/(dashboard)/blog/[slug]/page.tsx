import { notFound } from 'next/navigation';

// Components
import { BlogPostDetailPageContent } from '@/components/pages';

// Helpers
import { getPostBySlug } from '@/helpers';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}
export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);

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

async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPostDetailPageContent post={post} />;
}

export default BlogPostPage;
