// Components
import { Button, Typography } from '../common';

// Icons
import CheckIcon from '../icons/Check';

// Types
import { PricingPlanCardProps } from '@/types';

function PricingPlanCard({ plan }: Readonly<PricingPlanCardProps>) {
  const { name, popular, price, description, features } = plan;
  return (
    <div
      key={name}
      className={`flex flex-col items-start justify-start gap-4 sm:gap-6 bg-white rounded-2xl sm:rounded-3xl py-8 px-6 sm:py-12 sm:px-15 shadow-form transition-all hover:shadow-lg ${
        popular
          ? 'border-2 border-orange-background relative'
          : 'border border-gray-background'
      }`}
    >
      {popular && (
        <div className='absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2'>
          <span className='bg-orange-background text-white px-3 py-1 sm:px-4 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap'>
            Most Popular
          </span>
        </div>
      )}

      <div className='text-center space-y-4 sm:space-y-6 w-full'>
        <Typography
          size='lg'
          content={name}
          className='text-orange-background font-semibold  sm:text-lg'
        />

        <Typography className='relative text-5xl sm:text-6xl lg:text-7xl font-bold text-primary'>
          {price}
          <span className='absolute bottom-8 sm:bottom-10 lg:bottom-12 text-gray-background text-xl sm:text-2xl font-semibold'>
            &#36;
          </span>
        </Typography>

        <Typography
          content={description}
          className='px-4 sm:px-8 text-gray-background  sm:text-lg font-semibold'
        />
      </div>

      <ul className='space-y-3 sm:space-y-4 flex-1 w-full'>
        {features.map(feature => (
          <li key={feature} className='flex items-center gap-2 sm:gap-3'>
            <CheckIcon
              width={16}
              height={16}
              className='sm:w-[18px] sm:h-[18px] flex-shrink-0'
            />
            <span className='text-primary  sm:text-lg font-semibold'>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant={plan.popular ? 'primary' : 'secondary'}
        className='w-full'
      >
        Get Started
      </Button>
    </div>
  );
}
export default PricingPlanCard;
