// Components
import { Heading } from '../common';
import Section from '../common/Section';
import { FeatureCard } from '../FeaturedCard';

// Constants
import { appCategories } from '@/constants/app-categories';

function ServicePage() {
  return (
    <>
      {/* App Categories Section */}
      <Section
        className='bg-white '
        centered
        style={{
          backgroundImage: "url('/images/background/service-background.png')",
          backgroundSize: 'cover',
        }}
      >
        <div className='flex flex-col justify-center items-center gap-20'>
          <Heading
            as='h3'
            className='w-159'
            size='2xl'
            content='Innovative Apps for Your Business Needs'
          />
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
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
}

export default ServicePage;
