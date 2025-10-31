import type { Meta, StoryObj } from '@storybook/nextjs';
import { SignInForm } from './index';
import { useForm } from 'react-hook-form';
import { SignInFormValues } from '@/utils';

const meta: Meta<typeof SignInForm> = {
  title: 'Form/SignInForm',
  component: SignInForm,
};
export default meta;

type Story = StoryObj<typeof SignInForm>;

export const Default: Story = {
  render: () => {
    const { control } = useForm<SignInFormValues>({
      defaultValues: { email: '', password: '' },
    });
    return (
      <SignInForm
        control={control}
        onSubmit={async () => {}}
        onSocialSignIn={async () => {}}
        isLoading={false}
      />
    );
  },
};
