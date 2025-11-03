import type { Meta, StoryObj } from '@storybook/nextjs';
import { PricingPlanCard } from './index';

const meta: Meta<typeof PricingPlanCard> = {
  title: 'Components/PricingPlanCard',
  component: PricingPlanCard,
};
export default meta;

type Story = StoryObj<typeof PricingPlanCard>;

export const Default: Story = {
  args: {
    plan: {
      name: 'Pro',
      popular: true,
      price: 49,
      description: 'Best for growing teams.',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
  },
};
