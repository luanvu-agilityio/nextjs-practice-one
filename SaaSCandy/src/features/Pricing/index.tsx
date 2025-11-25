'use client';

import { useState } from 'react';

// Icons
import { ArrowIcon } from '@/icons';

// Components
import { Heading, Typography, LazySection } from '@/components/ui';
import { PricingPlanCard } from './PricingPlanCard';
import { Switch } from '@/components';
import { pricingPlans } from '@/constants/pricing-plan';

const PricingPageContent = () => {
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

      <LazySection
        bgImageUrl="url('/images/background/pricing-background.png')"
        className='bg-gray-50  sm:px-6'
      >
        <div className='space-y-12 sm:space-y-20'>
          <div className='flex flex-col items-center justify-between text-center gap-8 sm:gap-15'>
            <Typography
              size='lg'
              className='text-gray-background font-semibold  sm:text-lg'
            >
              Pricing Plan
            </Typography>
            <Heading
              as='h2'
              size='2xl'
              content="What's About Our Pricing Subscription"
              className='text-primary max-w-full sm:w-145 text-2xl sm:text-5xl lg:text-6xl px-4'
            />

            {/* Billing Toggle */}
            <div className='flex flex-col gap-2 items-center'>
              <div className='inline-flex items-center gap-3 sm:gap-4'>
                <span
                  className={`font-semibold  sm:text-lg ${!isYearly ? 'text-primary' : 'text-gray-background'}`}
                >
                  Monthly
                </span>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className='w-10 h-5 sm:w-12 sm:h-6'
                  aria-label='Toggle billing period: Monthly or Yearly'
                />
                <span
                  className={`font-semibold  sm:text-lg ${isYearly ? 'text-primary' : 'text-gray-background'}`}
                >
                  Yearly
                </span>
              </div>

              <div className='mt-2 inline-flex items-center gap-1.5 text-orange-background'>
                <span className='text-xs sm:text-sm font-medium'>
                  Save Up To 50%
                </span>
                <ArrowIcon
                  width={20}
                  height={14}
                  className='sm:w-[27px] sm:h-[18px]'
                />
              </div>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mx-auto max-w-7xl'>
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
      </LazySection>
    </>
  );
};

export { PricingPageContent };
