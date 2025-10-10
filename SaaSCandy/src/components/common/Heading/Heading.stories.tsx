import type { Meta, StoryObj } from '@storybook/nextjs-vite';

// Components
import { Heading } from './index';

const meta: Meta<typeof Heading> = {
  title: 'Common/Heading',
  component: Heading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'The semantic HTML tag to use',
    },
    size: {
      control: 'select',
      options: ['lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
      description:
        'The visual size of the heading (overrides tag-based sizing)',
    },
    content: {
      control: 'text',
      description: 'The heading text content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    as: 'h1',
    content: 'Welcome to Our Platform',
  },
};

export const AllTags: Story = {
  render: () => (
    <div className='space-y-4'>
      <Heading as='h1' content='Heading 1 - Main Title' />
      <Heading as='h2' content='Heading 2 - Section Title' />
      <Heading as='h3' content='Heading 3 - Subsection Title' />
      <Heading as='h4' content='Heading 4 - Minor Section' />
      <Heading as='h5' content='Heading 5 - Small Section' />
      <Heading as='h6' content='Heading 6 - Smallest Section' />
    </div>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <div className='space-y-4'>
      <Heading as='h1' size='xs' content='Extra Small Heading' />
      <Heading as='h1' size='sm' content='Small Heading' />
      <Heading as='h1' size='md' content='Medium Heading' />
      <Heading as='h1' size='lg' content='Large Heading' />
      <Heading as='h1' size='xl' content='Extra Large Heading' />
      <Heading as='h1' size='2xl' content='2 Extra Large Heading' />
    </div>
  ),
};

export const WithAccessibility: Story = {
  args: {
    as: 'h1',
    content: 'Accessible Heading',
  },
};

export const CustomStyling: Story = {
  args: {
    as: 'h1',
    content: 'Custom Styled Heading',
    className: 'underline decoration-2 decoration-primary underline-offset-4',
  },
};
