import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Typography } from '.';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    content: {
      control: { type: 'text' },
    },
    className: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
    content: 'This is a medium-sized typography component.',
  },
};

export const ExtraSmall: Story = {
  args: {
    size: 'xs',
    content: 'This is extra small text.',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    content: 'This is small text.',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    content: 'This is medium text.',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    content: 'This is large text.',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    content: 'This is extra large text.',
  },
};

export const TwoExtraLarge: Story = {
  args: {
    size: '2xl',
    content: 'This is 2xl text.',
  },
};

export const WithChildren: Story = {
  render: () => (
    <Typography size='lg' className='text-purple-background'>
      This typography uses <strong>children</strong> instead of content prop.
    </Typography>
  ),
};

export const CustomStyling: Story = {
  args: {
    size: 'lg',
    content: 'This text has custom styling applied.',
    className: 'text-purple-background font-bold',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Typography size='xs'>Extra Small (xs) - 12px</Typography>
      <Typography size='sm'>Small (sm) - 14px</Typography>
      <Typography size='md'>Medium (md) - 16px</Typography>
      <Typography size='lg'>Large (lg) - 18px</Typography>
      <Typography size='xl'>Extra Large (xl) - 20px</Typography>
      <Typography size='2xl'>2X Large (2xl) - 24px</Typography>
    </div>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Typography size='md' className='text-primary'>
        Primary Color
      </Typography>
      <Typography size='md' className='text-purple-background'>
        Purple Background
      </Typography>
      <Typography size='md' className='text-purple-foreground'>
        Purple Foreground
      </Typography>
      <Typography size='md' className='text-gray-foreground'>
        Gray Foreground
      </Typography>
      <Typography size='md' className='text-success'>
        Success Color
      </Typography>
      <Typography size='md' className='text-destructive-background'>
        Destructive Color
      </Typography>
    </div>
  ),
};
