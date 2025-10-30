import type { Meta, StoryObj } from '@storybook/react';
import { Share } from './index';

const meta: Meta<typeof Share> = {
  title: 'Common/Share',
  component: Share,
};
export default meta;

type Story = StoryObj<typeof Share>;

export const Default: Story = {
  args: {
    url: 'https://example.com',
    title: 'Share this page',
    className: '',
  },
};
