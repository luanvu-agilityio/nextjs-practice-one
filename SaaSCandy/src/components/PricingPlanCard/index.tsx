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
      className={`flex flex-col items-start justify-start gap-6 bg-white rounded-3xl py-12 px-15 shadow-form transition-all hover:shadow-lg ${
        popular
          ? 'border border-orange-background relative'
          : 'border border-gray-background'
      }`}
    >
      {popular && (
        <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
          <span className='bg-orange-background text-white px-4 py-1 rounded-full text-sm font-medium'>
            Most Popular
          </span>
        </div>
      )}

      <div className='text-center space-y-6'>
        <Typography
          size='lg'
          content={name}
          className='text-orange-background font-semibold'
        />

        <Typography className='relative text-7xl font-bold text-primary'>
          {price}
          <span className='absolute bottom-12 text-gray-background  text-2xl font-semibold'>
            &#36;
          </span>
        </Typography>

        <Typography
          content={description}
          className='w-57 text-gray-background text-lg font-semibold'
        />
      </div>

      <ul className='space-y-4 flex-1'>
        {features.map(feature => (
          <li key={feature} className='flex items-center gap-3'>
            <CheckIcon width={18} height={18} />
            <span className='text-primary text-lg font-semibold'>
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
