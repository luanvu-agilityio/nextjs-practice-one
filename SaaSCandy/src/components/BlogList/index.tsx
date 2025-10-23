import { getAllPosts } from '@/helpers';
import { BlogCard } from '../BlogCard';

async function BlogList() {
  const posts = await getAllPosts();
  return (
    <>
      {posts.map(p => (
        <BlogCard key={p.slug} {...p} />
      ))}
    </>
  );
}

export default BlogList;
