import type { Meta, StoryObj } from '@storybook/nextjs';
import { ErrorMessage } from './index';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Common/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs'],
  argTypes: {
    customMessage: { control: 'text' },
    className: { control: 'text' },
    error: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof ErrorMessage>;

export const Default: Story = {
  args: {
    customMessage: 'Something went wrong. Please try again.',
  },
};

export const WithErrorString: Story = {
  args: {
    error: 'Invalid credentials',
  },
};

export const WithHttpError: Story = {
  args: {
    error: { status: 404, message: 'Not Found' },
  },
};
