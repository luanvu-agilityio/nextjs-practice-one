import type { Meta, StoryObj } from '@storybook/nextjs';
import { UserMenu } from './index';

const meta: Meta<typeof UserMenu> = {
  title: 'Components/UserMenu',
  component: UserMenu,
};
export default meta;

type Story = StoryObj<typeof UserMenu>;

export const Default: Story = {
  args: {
    className: '',
  },
};
