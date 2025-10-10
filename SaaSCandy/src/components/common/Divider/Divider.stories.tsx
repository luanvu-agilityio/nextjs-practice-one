import type { Meta, StoryObj } from '@storybook/nextjs';
import { Divider } from '.';

const meta: Meta<typeof Divider> = {
  title: 'Common/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomText: Story = {
  args: {
    text: 'AND',
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'my-8',
  },
};

export const EmptyText: Story = {
  args: {
    text: '',
  },
};
