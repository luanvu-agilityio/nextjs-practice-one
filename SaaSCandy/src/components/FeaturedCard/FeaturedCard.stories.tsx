import type { Meta, StoryObj } from '@storybook/nextjs';
import { FeatureCard } from './index';
import { BookIcon } from '@/icons';

const meta: Meta<typeof FeatureCard> = {
  title: 'Common/FeaturedCard',
  component: FeatureCard,
};
export default meta;

type Story = StoryObj<typeof FeatureCard>;

export const Default: Story = {
  args: {
    title: 'Feature Title',
    description: 'Feature description goes here.',
    icon: <BookIcon />,
    href: 'https://example.com',
    actionText: 'Read More',
  },
};
