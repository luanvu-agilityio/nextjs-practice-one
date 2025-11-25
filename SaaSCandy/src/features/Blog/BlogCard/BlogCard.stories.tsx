import type { Meta, StoryObj } from '@storybook/nextjs';
import { BlogCard } from './index';

const meta: Meta<typeof BlogCard> = {
  title: 'Components/BlogCard',
  component: BlogCard,
};
export default meta;

type Story = StoryObj<typeof BlogCard>;

export const Default: Story = {
  args: {
    slug: 'my-blog-post',
    title: 'My Blog Post',
    image: '',
    date: '2025-10-29',
  },
};
