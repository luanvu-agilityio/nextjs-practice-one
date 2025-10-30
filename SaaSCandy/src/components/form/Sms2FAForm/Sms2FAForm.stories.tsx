import type { Meta, StoryObj } from '@storybook/react';
import { Sms2FAForm } from './index';

const meta: Meta<typeof Sms2FAForm> = {
  title: 'Form/Sms2FAForm',
  component: Sms2FAForm,
};
export default meta;

type Story = StoryObj<typeof Sms2FAForm>;

export const Default: Story = {
  args: {
    phone: '+1234567890',
    code: '',
    setCode: () => {},
    onVerify: async () => {},
    onResend: async () => {},
    onBack: () => {},
    isLoading: false,
  },
};
