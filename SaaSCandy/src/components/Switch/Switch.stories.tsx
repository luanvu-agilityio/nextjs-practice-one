import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './index';

const meta: Meta<typeof Switch> = {
  title: 'Common/Switch',
  component: Switch,
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {},
};
