export type Plan = {
  name: string;
  price: string | number;
  description: string;
  features: string[];
  popular?: boolean;
};

export type PricingPlanCardProps = {
  plan: Plan;
};
