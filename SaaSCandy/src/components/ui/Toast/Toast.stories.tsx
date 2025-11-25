import type { Meta, StoryObj } from '@storybook/nextjs';

import { showToast } from './index';
import { Toaster } from 'sonner';
import { Button } from '../Button';
import { Heart } from 'lucide-react';

const meta: Meta = {
  title: 'Common/Toast',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div>
        <Story />
        <Toaster
          position='top-right'
          closeButton={false}
          richColors={false}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'bg-transparent shadow-none border-none p-0',
            },
          }}
        />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({
          title: 'Success!',
          description: 'Your operation was completed successfully.',
          variant: 'success',
        })
      }
    >
      Show Success Toast
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({
          title: 'Error!',
          description: 'Something went wrong. Please try again.',
          variant: 'error',
        })
      }
      variant='secondary'
    >
      Show Error Toast
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({
          title: 'Warning!',
          description: 'Please review your input before proceeding.',
          variant: 'warning',
        })
      }
    >
      Show Warning Toast
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({
          title: 'Information',
          description: 'Here is some useful information for you.',
          variant: 'info',
        })
      }
    >
      Show Info Toast
    </Button>
  ),
};

export const WithCustomIcon: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({
          title: 'Custom Icon',
          description: 'This toast has a custom heart icon.',
          variant: 'success',
          icon: <Heart className='size-5' />,
        })
      }
    >
      Show Custom Icon Toast
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-4'>
        <Button
          onClick={() =>
            showToast({
              title: 'Success!',
              description: 'Operation completed successfully.',
              variant: 'success',
            })
          }
        >
          Success
        </Button>
        <Button
          onClick={() =>
            showToast({
              title: 'Error!',
              description: 'Something went wrong.',
              variant: 'error',
            })
          }
          variant='secondary'
        >
          Error
        </Button>
        <Button
          onClick={() =>
            showToast({
              title: 'Warning!',
              description: 'Please be careful.',
              variant: 'warning',
            })
          }
        >
          Warning
        </Button>
        <Button
          onClick={() =>
            showToast({
              title: 'Info',
              description: 'Here is some information.',
              variant: 'info',
            })
          }
          variant='secondary'
        >
          Info
        </Button>
      </div>
    </div>
  ),
};
