import type { Meta, StoryObj } from '@storybook/nextjs';
import SignInForm from './index';

const meta: Meta<typeof SignInForm> = {
  title: 'Components/SignInForm',
  component: SignInForm,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SignInForm>;

export const Default: Story = {
  render: () => (
    <div className='min-h-screen bg-gray-50 py-12'>
      <SignInForm />
    </div>
  ),
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <div className='min-h-screen bg-gray-50 py-12'>
      <SignInForm />
    </div>
  ),
};
