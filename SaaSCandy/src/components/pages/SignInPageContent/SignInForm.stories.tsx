import type { Meta, StoryObj } from '@storybook/nextjs';
import { SignInPageContent } from './index';

const meta: Meta<typeof SignInPageContent> = {
  title: 'Components/SignInForm',
  component: SignInPageContent,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SignInPageContent>;

export const Default: Story = {
  render: () => (
    <div className='min-h-screen bg-gray-50 py-12'>
      <SignInPageContent />
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
      <SignInPageContent />
    </div>
  ),
};
