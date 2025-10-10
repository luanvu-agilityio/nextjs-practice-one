import { PricingPlan } from '@/types';

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Personal',
    price: 19,
    description: 'For individuals looking for a simple CRM solution',
    features: [
      'Basic CRM features',
      'Unlimited Personal Pipelines',
      'Email Power Tools',
    ],
  },
  {
    name: 'Professional',
    price: 49,
    description: 'For individuals looking for a simple CRM solution',
    features: [
      'Basic CRM features',
      'Unlimited Personal Pipelines',
      'Email Power Tools',
      'Unlimited Shared Pipelines',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    description: 'For individuals looking for a simple CRM solution',
    features: [
      'Basic CRM features',
      'Unlimited Personal Pipelines',
      'Email Power Tools',
      'Unlimited Shared Pipelines',
      'Full API Access',
    ],
  },
];
