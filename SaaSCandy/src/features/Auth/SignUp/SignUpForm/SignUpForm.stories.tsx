import type { Meta, StoryObj } from '@storybook/nextjs';
import { SignUpForm } from './index';
import { useForm } from 'react-hook-form';
import { SignUpFormValues } from '@/utils/validation';

const meta: Meta<typeof SignUpForm> = {
  title: 'Form/SignUpForm',
  component: SignUpForm,
};
export default meta;

type Story = StoryObj<typeof SignUpForm>;

export const Default: Story = {
  render: () => {
    const { control } = useForm<SignUpFormValues>({
      defaultValues: { name: '', email: '', password: '' },
    });
    return (
      <SignUpForm
        control={control}
        onSubmit={async () => {}}
        onSocialSignUp={async () => {}}
        isLoading={false}
      />
    );
  },
};
