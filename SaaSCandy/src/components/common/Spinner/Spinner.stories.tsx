import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './index';

const meta: Meta<typeof Spinner> = {
  title: 'Common/Spinner',
  component: Spinner,
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {},
};
