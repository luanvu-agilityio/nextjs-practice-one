import type { Meta, StoryObj } from '@storybook/nextjs';
import { CheckboxController } from './index';
import { useForm } from 'react-hook-form';

const meta: Meta<typeof CheckboxController> = {
  title: 'Common/CheckboxController',
  component: CheckboxController,
};
export default meta;

type Story = StoryObj<typeof CheckboxController>;

export const Default: Story = {
  render: () => {
    const { control } = useForm<{ agree: boolean }>({
      defaultValues: { agree: false },
    });
    return (
      <CheckboxController
        name='agree'
        control={control}
        label='I agree to the terms and conditions'
      />
    );
  },
};
