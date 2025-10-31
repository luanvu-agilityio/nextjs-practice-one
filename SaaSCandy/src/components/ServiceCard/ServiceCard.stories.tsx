import type { Meta, StoryObj } from '@storybook/nextjs';
import { ServiceCard } from './index';
import { BookIcon } from '@/icons';

const meta: Meta<typeof ServiceCard> = {
  title: 'Common/ServiceCard',
  component: ServiceCard,
};
export default meta;

type Story = StoryObj<typeof ServiceCard>;

export const Default: Story = {
  args: {
    index: 0,
    doc: {
      icon: <BookIcon />,
      title: 'Service Title',
      description: 'Service description goes here.',
    },
  },
};
