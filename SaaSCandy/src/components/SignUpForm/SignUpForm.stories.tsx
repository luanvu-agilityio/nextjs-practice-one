import type { Meta, StoryObj } from '@storybook/nextjs';

import { SignUpPageContent } from '.';

const meta: Meta<typeof SignUpPageContent> = {
  title: 'Components/SignUpForm',
  component: SignUpPageContent,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SignUpPageContent>;

export const Default: Story = {
  render: () => (
    <div className='min-h-screen bg-gray-50 py-12'>
      <SignUpPageContent />
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
      <SignUpPageContent />
    </div>
  ),
};
