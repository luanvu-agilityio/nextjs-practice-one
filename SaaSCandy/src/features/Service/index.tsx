// Components
import { Heading, Section } from '@/components/ui';
import { FeatureCard } from './FeaturedCard';

// Constants
import { appCategories } from '@/constants/app-categories';

const ServicePageContent = () => {
  return (
    <>
      {/* App Categories Section */}
      <Section
        className='bg-white px-4 sm:px-6'
        centered
        style={{
          backgroundImage: "url('/images/background/service-background.png')",
          backgroundSize: 'cover',
        }}
      >
        <div className='flex flex-col justify-center items-center gap-12 sm:gap-20'>
          <Heading
            as='h3'
            className='max-w-full sm:w-159 text-2xl sm:text-5xl lg:text-6xl px-4'
            size='2xl'
            content='Innovative Apps for Your Business Needs'
          />
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full'>
            {appCategories.map(category => (
              <FeatureCard
                key={category.title}
                title={category.title}
                description={category.description}
                icon={category.icon}
                href={category.href}
              />
            ))}
          </div>
        </div>
      </Section>
    </>
  );
};

export { ServicePageContent };
