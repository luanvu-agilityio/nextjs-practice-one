import PageLayout from '@/components/layout/PageLayout';
import BlogPage from '@/components/BlogPage';

export const metadata = {
  title: 'Blog | SaaSCandy',
  description: 'Discover articles, case studies and resources from SaaSCandy.',
};

export default function Blog() {
  return (
    <PageLayout
      title='Blog'
      subtitle='Discover a wealth of insightful materials meticulously crafted to provide you with a comprehensive understanding of the latest trends.'
    >
      <BlogPage />
    </PageLayout>
  );
}
