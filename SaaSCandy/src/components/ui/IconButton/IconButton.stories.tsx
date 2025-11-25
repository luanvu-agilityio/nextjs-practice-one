import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { IconButton } from './index';
import { Plus, X, Check, Settings } from 'lucide-react';

const meta: Meta<typeof IconButton> = {
  title: 'Common/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outline', 'ghost', 'disabled'],
    },
    size: {
      control: 'select',
      options: ['md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: <Plus size={16} />,
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    children: <X size={16} />,
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: <Check size={16} />,
  },
};

export const Disabled: Story = {
  args: {
    variant: 'disabled',
    size: 'md',
    disabled: true,
    children: <Settings size={16} />,
  },
};

export const LargeSize: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: <Plus size={20} />,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <IconButton variant='primary' size='md'>
        <Plus size={16} />
      </IconButton>
      <IconButton variant='outline' size='md'>
        <X size={16} />
      </IconButton>
      <IconButton variant='ghost' size='md'>
        <Check size={16} />
      </IconButton>
      <IconButton variant='disabled' size='md' disabled>
        <Settings size={16} />
      </IconButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <IconButton variant='primary' size='md'>
        <Plus size={16} />
      </IconButton>
      <IconButton variant='primary' size='lg'>
        <Plus size={20} />
      </IconButton>
    </div>
  ),
};
