import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '.';

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'large'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    children: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'small',
    children: 'Order Now',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'small',
    children: 'Cancel Order',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'large',
    children: 'Get Started Today',
  },
};

export const LargeSecondary: Story = {
  args: {
    variant: 'secondary',
    size: 'large',
    children: 'Learn More',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'small',
    children: 'Disabled Button',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-4'>
        <Button variant='primary' size='small'>
          Primary Small
        </Button>
        <Button variant='secondary' size='small'>
          Secondary Small
        </Button>
      </div>
      <div className='flex gap-4'>
        <Button variant='primary' size='large'>
          Primary Large
        </Button>
        <Button variant='secondary' size='large'>
          Secondary Large
        </Button>
      </div>
      <div className='flex gap-4'>
        <Button variant='primary' size='small' disabled>
          Disabled Primary
        </Button>
        <Button variant='secondary' size='small' disabled>
          Disabled Secondary
        </Button>
      </div>
    </div>
  ),
};
