import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from './index';
import { Search, Mail } from 'lucide-react';

const meta = {
  title: 'Common/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
    disabled: {
      control: 'boolean',
    },
    hideLabel: {
      control: 'boolean',
    },
    showPasswordToggle: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
    errorMessage: 'Invalid email address',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    showPasswordToggle: true,
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leftElement: <Search className='h-4 w-4' />,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    rightElement: <Mail className='h-4 w-4' />,
  },
};

export const Secondary: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    variant: 'secondary',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    disabled: true,
    value: 'disabled@example.com',
  },
};

export const HiddenLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    hideLabel: true,
  },
};
