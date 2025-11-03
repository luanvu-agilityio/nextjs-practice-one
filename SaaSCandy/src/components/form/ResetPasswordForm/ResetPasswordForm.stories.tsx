import type { Meta, StoryObj } from '@storybook/nextjs';
import { ResetPasswordForm } from './index';

const meta: Meta<typeof ResetPasswordForm> = {
  title: 'Form/ResetPasswordForm',
  component: ResetPasswordForm,
};
export default meta;

type Story = StoryObj<typeof ResetPasswordForm>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <ResetPasswordForm
        token='storybook-token'
        onSuccess={() => {
          // Storybook friendly success handler
          // eslint-disable-next-line no-console
          console.log('Reset success from story');
        }}
      />
    </div>
  ),
};
