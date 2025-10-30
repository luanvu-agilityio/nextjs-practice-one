import type { Meta, StoryObj } from '@storybook/react';
import { ForgotPasswordForm } from './index';

const meta: Meta<typeof ForgotPasswordForm> = {
  title: 'Form/ForgotPasswordForm',
  component: ForgotPasswordForm,
};
export default meta;

type Story = StoryObj<typeof ForgotPasswordForm>;

export const Default: Story = {
  render: () => <ForgotPasswordForm />,
};
