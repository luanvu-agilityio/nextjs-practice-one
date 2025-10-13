// Components
import Section from '../common/Section';
import { BlogCard } from '../BlogCard';

// Helper
import { getAllPosts } from '@/helpers';

async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <Section className='bg-white'>
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {posts.map(p => (
          <BlogCard key={p.slug} {...p} />
        ))}
      </div>
    </Section>
  );
}
export default BlogPage;
