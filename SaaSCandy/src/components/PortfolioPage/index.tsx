'use client';

import React from 'react';
import Image from 'next/image';

// Components
import { Button, Heading, Typography } from '@/components/common';
import Section from '../common/Section';

// Icons
import CheckIcon from '../icons/Check';
import ServiceCard from '../ServiceCard';

// Constants
import { docs, features } from '@/constants';

function PortfolioPage() {
  return (
    <>
      {/* Features Section */}
      <Section>
        <div className='flex justify-center gap-33.5 items-center'>
          {/* Dashboard Image */}

          <Image
            src='/images/hero/stats.png'
            alt='stats image'
            className='bg-cover w-159 h-126.75'
            width={636}
            height={507}
          />

          {/* Features List */}
          <div className='space-y-8'>
            <Typography className='text-lg font-semibold text-gray-background'>
              Why choose us
            </Typography>
            <Heading
              as='h3'
              size='2xl'
              className=''
              content='Top Features That Set Us Apart'
            />
            <div className='flex flex-col justify-between gap-6'>
              {features.map((feature, index) => (
                <div key={index} className='flex items-start gap-3'>
                  <div className='flex items-center justify-start'>
                    <CheckIcon width={18} height={18} />
                  </div>
                  <Typography
                    content={feature}
                    className='text-gray-background text-lg font-semibold'
                  />
                </div>
              ))}
            </div>
            <Button variant='primary'>All Services</Button>
          </div>
        </div>
      </Section>

      {/* Documentation Section */}
      <Section
        className='bg-blue-background text-white'
        style={{
          backgroundImage: "url('/images/background/portfolio-background.png')",
          backgroundSize: 'cover',
        }}
      >
        <div className='space-y-20'>
          <div className='flex items-center justify-between'>
            <div className='flex flex-col items-start gap-7.5 w-120'>
              <Typography
                size='lg'
                className='text-orange-background font-semibold'
              >
                Product Docs
              </Typography>
              <Heading
                as='h3'
                size='2xl'
                content='Beautiful Docs for your APIs.'
                className='text-white'
              />
            </div>
            <Button variant='primary'>Open Portfolio</Button>
          </div>

          {/* Services Grid */}
          <div className='grid md:grid-cols-3 gap-8 mb-12'>
            {docs.map((doc, index) => (
              <ServiceCard key={doc.title} index={index} doc={doc} />
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className='flex items-center justify-center gap-6'>
            {/* Left Column */}
            <Image
              src='/images/portfolio/portfolio-1.png'
              alt='Portfolio 1'
              width={636}
              height={420}
            />
            <Image
              src='/images/portfolio/portfolio-2.png'
              alt='Portfolio 2'
              width={636}
              height={420}
            />
          </div>
        </div>
      </Section>
    </>
  );
}

export default PortfolioPage;
