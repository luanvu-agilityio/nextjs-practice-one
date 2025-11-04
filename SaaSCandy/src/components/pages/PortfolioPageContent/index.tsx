'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Components
import {
  Button,
  Heading,
  Typography,
  Section,
  LazySection,
} from '@/components/common';
import { ServiceCard } from '@/components/ServiceCard';

// Icons
import { CheckIcon } from '@/icons/Check';

// Constants
import { docs, features, ROUTES } from '@/constants';

const PortfolioPageContent = () => {
  const router = useRouter();
  const handleNavigation = () => {
    router.push(ROUTES.SERVICES);
  };
  return (
    <>
      {/* Features Section */}
      <Section className='px-4 sm:px-6'>
        <div className='flex flex-col lg:flex-row justify-center gap-8 lg:gap-33.5 items-center relative w-full  rounded-xl overflow-hidden'>
          {/* Dashboard Image */}
          <Image
            src='/images/hero/stats.png'
            alt='stats image'
            width={686}
            height={515}
            sizes='(min-width:1024px) 636px, 100vw'
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              objectPosition: '12% 50%',
            }}
          />

          {/* Features List */}
          <div className='space-y-6 sm:space-y-8 w-full lg:w-auto'>
            <Typography className='sm:text-lg font-semibold text-gray-background'>
              Why choose us
            </Typography>
            <Heading
              as='h3'
              size='2xl'
              className='text-2xl sm:text-5xl lg:text-6xl'
              content='Top Features That Set Us Apart'
            />
            <div className='flex flex-col justify-between gap-4 sm:gap-6'>
              {features.map((feature, index) => (
                <div key={index} className='flex items-start gap-3'>
                  <div className='flex items-center justify-start flex-shrink-0'>
                    <CheckIcon width={18} height={18} />
                  </div>
                  <Typography
                    content={feature}
                    className='text-gray-background  sm:text-lg font-semibold'
                  />
                </div>
              ))}
            </div>
            <Button
              variant='primary'
              onClick={handleNavigation}
              className='w-full sm:w-auto'
            >
              All Services
            </Button>
          </div>
        </div>
      </Section>

      {/* Documentation Section */}

      <LazySection
        bgImageUrl="url('/images/background/portfolio-background.png')"
        className='bg-blue-background text-white px-4 sm:px-6'
      >
        <div className='space-y-12 sm:space-y-20'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-0'>
            <div className='flex flex-col items-start gap-4 sm:gap-7.5 w-full sm:w-120'>
              <Typography
                size='lg'
                className='text-orange-background font-semibold  sm:text-lg'
              >
                Product Docs
              </Typography>
              <Heading
                as='h3'
                size='2xl'
                content='Beautiful Docs for your APIs.'
                className='text-white text-2xl sm:text-5xl lg:text-6xl'
              />
            </div>
            <Button variant='primary' className='w-full sm:w-auto'>
              Open Portfolio
            </Button>
          </div>

          {/* Services Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12'>
            {docs.map((doc, index) => (
              <ServiceCard key={doc.title} index={index} doc={doc} />
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6'>
            <Image
              src='/images/portfolio/portfolio-1.png'
              alt='Portfolio 1'
              width={636}
              height={420}
              className='w-full sm:w-1/2 h-auto rounded-xl'
            />
            <Image
              src='/images/portfolio/portfolio-2.png'
              alt='Portfolio 2'
              width={636}
              height={420}
              className='w-full sm:w-1/2 h-auto rounded-xl'
            />
          </div>
        </div>
      </LazySection>
    </>
  );
};

export { PortfolioPageContent };
