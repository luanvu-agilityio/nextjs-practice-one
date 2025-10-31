import type { Meta, StoryObj } from '@storybook/nextjs';
import { TwoFactorForm } from './index';

const meta: Meta<typeof TwoFactorForm> = {
  title: 'Form/TwoFactorForm',
  component: TwoFactorForm,
};
export default meta;

type Story = StoryObj<typeof TwoFactorForm>;

export const Default: Story = {
  args: {
    userEmail: 'user@example.com',
    twoFactorCode: '',
    onCodeChange: () => {},
    onVerify: async () => {},
    onResendCode: async () => {},
    onBack: () => {},
    isLoading: false,
  },
};
