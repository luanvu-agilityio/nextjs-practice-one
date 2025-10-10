import type { Meta, StoryObj } from '@storybook/nextjs';
import SignUpForm from './index';

const meta: Meta<typeof SignUpForm> = {
  title: 'Components/SignUpForm',
  component: SignUpForm,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SignUpForm>;

export const Default: Story = {
  render: () => (
    <div className='min-h-screen bg-gray-50 py-12'>
      <SignUpForm />
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
      <SignUpForm />
    </div>
  ),
};
