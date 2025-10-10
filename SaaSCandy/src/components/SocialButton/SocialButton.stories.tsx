import type { Meta, StoryObj } from '@storybook/nextjs';
import SocialButton from './index';

// Mock icons
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox='0 0 24 24' fill='currentColor'>
    <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox='0 0 24 24' fill='currentColor'>
    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
  </svg>
);

const meta: Meta<typeof SocialButton> = {
  title: 'Components/SocialButton',
  component: SocialButton,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SocialButton>;

export const Google: Story = {
  args: {
    provider: 'google',
    icon: GoogleIcon,
    children: 'Continue with Google',
  },
};

export const Facebook: Story = {
  args: {
    provider: 'facebook',
    icon: FacebookIcon,
    children: 'Continue with Facebook',
  },
};

export const Disabled: Story = {
  args: {
    provider: 'google',
    icon: GoogleIcon,
    children: 'Continue with Google',
    disabled: true,
  },
};
