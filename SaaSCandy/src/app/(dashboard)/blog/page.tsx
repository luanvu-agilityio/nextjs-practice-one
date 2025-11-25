import { PageLayout } from '@/components/layout';
import { BlogPageContent } from '@/features';

export const metadata = {
  title: 'Blog | SaaSCandy',
  description: 'Discover articles, case studies and resources from SaaSCandy.',
};

const BlogPage = () => {
  return (
    <PageLayout
      title='Blog'
      subtitle='Discover a wealth of insightful materials meticulously crafted to provide you with a comprehensive understanding of the latest trends.'
    >
      <BlogPageContent />
    </PageLayout>
  );
};
export default BlogPage;
