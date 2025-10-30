import type { Meta, StoryObj } from '@storybook/react';
import { ResetPasswordForm } from './index';

const meta: Meta<typeof ResetPasswordForm> = {
  title: 'Form/ResetPasswordForm',
  component: ResetPasswordForm,
};
export default meta;

type Story = StoryObj<typeof ResetPasswordForm>;

export const Default: Story = {
  render: () => <ResetPasswordForm />,
};
