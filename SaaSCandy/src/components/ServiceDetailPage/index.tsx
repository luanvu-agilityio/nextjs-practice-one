'use client';

import React from 'react';
import Image from 'next/image';

// Components
import Section from '../common/Section';
import { Heading, Typography } from '@/components/common';

// Types
import { Service } from '@/types';

// Icons
import CheckIcon from '../icons/Check';

interface ServiceDetailPageProps {
  service: Service;
}

function ServiceDetailPage({ service }: Readonly<ServiceDetailPageProps>) {
  return (
    <>
      {/* What It Does Section */}
      <Section className='bg-white'>
        <div className='flex justify-between gap-33.5 items-center'>
          {/* Left Content */}
          <Image
            src='/images/service/service-1.png'
            alt='edtech app'
            className='w-159 h-159'
          />

          {/* Right Image */}
          <div className='space-y-4'>
            <div>
              <Heading
                as='h3'
                size='xl'
                content='What It'
                className='text-primary font-bold inline'
              />
              <span className='text-orange-background font-bold text-5xl'>
                {' '}
                Does
              </span>
            </div>

            <Typography
              content={service.whatItDoes.description}
              className='text-gray-background font-regular leading-relaxed text-xl'
            />
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section className='bg-inactive-background'>
        <div className='space-y-4'>
          <Heading
            as='h3'
            size='xl'
            content='Features'
            className='text-primary font-bold inline'
          />
          {service.features.map(feature => (
            <div key={feature.id} className='flex items-start gap-3'>
              <CheckIcon
                className='w-4 h-4 text-orange-background'
                fill='orange'
              />

              <div className='flex-1'>
                <span className='text-primary font-medium text-xl'>
                  {feature.title}:
                </span>

                <span className='text-gray-background leading-relaxed'>
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
}

export default ServiceDetailPage;
