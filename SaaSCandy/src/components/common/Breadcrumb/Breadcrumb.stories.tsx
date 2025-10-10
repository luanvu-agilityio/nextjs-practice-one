import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './index';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Common/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Visual variant for different backgrounds',
      table: {
        type: { summary: 'light | dark' },
        defaultValue: { summary: 'light' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A breadcrumb component with light and dark variants for navigation hierarchy.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const LightVariant: Story = {
  args: {
    variant: 'light',
  },
  render: args => (
    <div className='p-8 bg-white rounded-lg'>
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/products'>Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light' active>
            <BreadcrumbPage>Laptop</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Basic breadcrumb with light variant for use on light backgrounds.',
      },
    },
  },
};

export const DarkVariant: Story = {
  args: {
    variant: 'dark',
  },
  render: args => (
    <div className='p-8 bg-slate-900 rounded-lg'>
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem variant='dark'>
            <BreadcrumbLink href='/'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='dark' />
          <BreadcrumbItem variant='dark'>
            <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='dark' />
          <BreadcrumbItem variant='dark' active>
            <BreadcrumbPage>Analytics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Breadcrumb with dark variant optimized for dark backgrounds.',
      },
    },
  },
};

export const WithCustomSeparator: Story = {
  args: {
    variant: 'light',
  },
  render: args => (
    <div className='p-8 bg-white rounded-lg'>
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light'>
            <span className='text-slate-400'>/</span>
          </BreadcrumbSeparator>
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/docs'>Documentation</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light'>
            <span className='text-slate-400'>/</span>
          </BreadcrumbSeparator>
          <BreadcrumbItem variant='light' active>
            <BreadcrumbPage>Components</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Breadcrumb using a custom separator character instead of the default chevron.',
      },
    },
  },
};

export const WithEllipsis: Story = {
  args: {
    variant: 'light',
  },
  render: args => (
    <div className='p-8 bg-white rounded-lg'>
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light'>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/products'>Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light' active>
            <BreadcrumbPage>Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Breadcrumb with collapsed middle items shown as ellipsis, useful for long paths.',
      },
    },
  },
};

export const LongPath: Story = {
  args: {
    variant: 'light',
  },
  render: args => (
    <div className='p-8 bg-white rounded-lg'>
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/category'>Category</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/subcategory'>Subcategory</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/products'>Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light' active>
            <BreadcrumbPage>Product Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Extended navigation path with multiple levels showing responsive wrapping behavior.',
      },
    },
  },
};

export const DarkWithEllipsis: Story = {
  args: {
    variant: 'dark',
  },
  render: args => (
    <div className='p-8 bg-slate-900 rounded-lg'>
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem variant='dark'>
            <BreadcrumbLink href='/'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='dark' />
          <BreadcrumbItem variant='dark'>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='dark' />
          <BreadcrumbItem variant='dark'>
            <BreadcrumbLink href='/settings'>Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='dark' />
          <BreadcrumbItem variant='dark' active>
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story:
          'Dark variant breadcrumb with collapsed items for use on dark backgrounds.',
      },
    },
  },
};

export const WithCustomLink: Story = {
  args: {
    variant: 'light',
  },
  render: args => {
    // Example with Next.js Link (simulated)
    const NextLink = ({
      href,
      children,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={href} {...props}>
        {children}
      </a>
    );

    return (
      <div className='p-8 bg-white rounded-lg'>
        <Breadcrumb {...args}>
          <BreadcrumbList>
            <BreadcrumbItem variant='light'>
              <BreadcrumbLink asChild>
                <NextLink href='/'>Home</NextLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='light' />
            <BreadcrumbItem variant='light'>
              <BreadcrumbLink asChild>
                <NextLink href='/blog'>Blog</NextLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='light' />
            <BreadcrumbItem variant='light' active>
              <BreadcrumbPage>Article Title</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Using the asChild prop to compose with custom link components like Next.js Link.',
      },
    },
  },
};

export const Responsive: Story = {
  args: {
    variant: 'light',
  },
  render: args => (
    <div className='p-8 bg-white rounded-lg max-w-md'>
      <p className='text-sm text-slate-600 mb-4'>
        Resize to see wrapping behavior
      </p>
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light'>
            <BreadcrumbLink href='/very-long-category-name'>
              Very Long Category Name
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator variant='light' />
          <BreadcrumbItem variant='light' active>
            <BreadcrumbPage>Another Long Page Title</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates responsive wrapping behavior with long breadcrumb items.',
      },
    },
  },
};
