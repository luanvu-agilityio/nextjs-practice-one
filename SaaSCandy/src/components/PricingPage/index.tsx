'use client';

import { useState } from 'react';

// Icons
import ArrowIcon from '../icons/Arrow';

// Components
import Section from '../common/Section';
import { Heading, Typography } from '@/components/common';
import PricingPlanCard from '../PricingPlanCard';
import { Switch } from '../ui/switch';
import { pricingPlans } from '@/constants/pricing-plan';

function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (monthlyPrice: number) => {
    if (isYearly) {
      return Math.round(monthlyPrice * 12 * 0.5);
    }
    return monthlyPrice;
  };

  return (
    <>
      {/* Pricing Plans Section */}
      <Section
        className='bg-gray-50'
        style={{
          backgroundImage: "url('/images/background/pricing-background.png')",
          backgroundSize: 'cover',
        }}
      >
        <div className='space-y-20'>
          <div className='flex flex-col items-center justify-between text-center gap-15'>
            <Typography
              size='lg'
              className='text-gray-background font-semibold'
            >
              Pricing Plan
            </Typography>
            <Heading
              as='h2'
              size='2xl'
              content="What's About Our Pricing Subscription"
              className='text-primary w-145'
            />

            {/* Billing Toggle */}
            <div className='flex flex-col gap-2 items-center'>
              <div className='inline-flex items-center gap-4'>
                <span
                  className={`font-semibold text-lg ${!isYearly ? 'text-primary' : 'text-gray-background'}`}
                >
                  Monthly
                </span>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className='w-12 h-6'
                />
                <span
                  className={`font-semibold text-lg ${isYearly ? 'text-primary' : 'text-gray-background'}`}
                >
                  Yearly
                </span>
              </div>

              <div className='mt-2 inline-flex items-center gap-1.5 text-orange-background'>
                <span className='text-sm font-medium'>Save Up To 50%</span>
                <ArrowIcon width={27} height={18} />
              </div>
            </div>
          </div>
          <div className='grid md:grid-cols-3 gap-6 mx-auto'>
            {pricingPlans.map(plan => (
              <PricingPlanCard
                key={plan.name}
                plan={{
                  ...plan,
                  price: getPrice(plan.price),
                }}
              />
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

export default PricingPage;
