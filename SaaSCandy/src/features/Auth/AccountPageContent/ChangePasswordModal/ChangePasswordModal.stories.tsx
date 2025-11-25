import type { Meta, StoryObj } from '@storybook/nextjs';
import { ChangePasswordModal } from './index';

const meta: Meta<typeof ChangePasswordModal> = {
  title: 'Form/ChangePasswordModal',
  component: ChangePasswordModal,
};
export default meta;

type Story = StoryObj<typeof ChangePasswordModal>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onSuccess: () => {},
  },
};
