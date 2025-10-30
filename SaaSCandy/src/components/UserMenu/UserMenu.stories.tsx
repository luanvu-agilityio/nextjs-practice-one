import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu } from './index';

const meta: Meta<typeof UserMenu> = {
  title: 'Common/UserMenu',
  component: UserMenu,
};
export default meta;

type Story = StoryObj<typeof UserMenu>;

export const Default: Story = {
  args: {
    className: '',
  },
};
