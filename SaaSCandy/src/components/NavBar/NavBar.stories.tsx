import type { Meta, StoryObj } from '@storybook/nextjs';
import Navbar from './index';

const meta: Meta<typeof Navbar> = {
  title: 'Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  render: () => (
    <div className='relative p-4 bg-gray-100'>
      <Navbar />
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
    <div className='relative p-4 bg-gray-100'>
      <Navbar />
    </div>
  ),
};
