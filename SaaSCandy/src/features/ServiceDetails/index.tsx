'use client';

import React from 'react';
import Image from 'next/image';

// Components
import { Heading, Typography, Section } from '@/components/ui';

// Types
import { Service } from '@/types';

// Icons
import { CheckIcon } from '@/icons';

interface ServiceDetailPageProps {
  service: Service;
}

const ServiceDetailPageContent = ({
  service,
}: Readonly<ServiceDetailPageProps>) => {
  return (
    <>
      {/* What It Does Section */}
      <Section className='bg-white'>
        <div className='flex flex-col lg:flex-row justify-between gap-8 lg:gap-33.5 items-center'>
          {/* Left Image */}
          <div className='w-full lg:w-159 flex justify-center lg:justify-start'>
            <Image
              src='/images/service/service-1.png'
              alt='edtech app'
              width={636}
              height={636}
              sizes='(max-width: 1024px) 100vw, 636px'
              priority
              className='w-full lg:max-w-none lg:w-159 lg:h-159 rounded-2xl sm:rounded-3xl'
            />
          </div>

          {/* Right Content */}
          <div className='space-y-4 sm:space-y-6 w-full lg:w-auto'>
            <div>
              <Heading
                as='h3'
                size='xl'
                content='What It'
                className='text-primary font-bold inline text-2xl sm:text-4xl lg:text-5xl'
              />
              <span className='text-orange-background font-bold text-2xl sm:text-4xl lg:text-5xl'>
                {' '}
                Does
              </span>
            </div>

            <Typography
              content={service.whatItDoes.description}
              className='text-gray-background font-regular leading-relaxed  sm:text-lg lg:text-xl'
            />
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section className='bg-inactive-background'>
        <div className='space-y-4 sm:space-y-6'>
          <Heading
            as='h3'
            size='xl'
            content='Features'
            className='text-primary font-bold text-2xl sm:text-4xl lg:text-5xl mb-6 sm:mb-8'
          />
          {service.features.map(feature => (
            <div key={feature.id} className='flex items-start gap-2 sm:gap-3'>
              <CheckIcon
                className='w-4 h-4 sm:w-5 sm:h-5 text-orange-background flex-shrink-0 mt-1'
                fill='orange'
              />

              <div className='flex-1'>
                <span className='text-primary font-medium sm:text-lg lg:text-xl'>
                  {feature.title}:
                </span>

                <span className='text-gray-background leading-relaxed  sm:text-lg lg:text-xl'>
                  {' '}
                  {feature.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
};

export { ServiceDetailPageContent };
