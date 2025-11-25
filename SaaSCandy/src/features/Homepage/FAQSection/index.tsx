'use client';

import { useState } from 'react';

// Constants
import { faqData } from '@/constants';

// Components
import { Heading, Typography, Section } from '@/components/ui';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section className='bg-white px-4 sm:px-6'>
      <div className='mx-auto space-y-12 sm:space-y-20'>
        <div className='text-center space-y-4 sm:space-y-7.5'>
          <Typography
            size='lg'
            className='text-gray-background font-semibold  sm:text-lg'
          >
            Frequently Asked Questions
          </Typography>
          <Heading
            as='h2'
            size='2xl'
            content='Want to ask something from us?'
            className='text-primary text-2xl sm:text-5xl lg:text-6xl px-4'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-4'>
          {faqData.map((faq, index) => (
            <div
              key={index}
              className='bg-light-gray rounded-[10px] py-4 px-4 sm:py-6 sm:px-7.5 space-y-4 sm:space-y-6 cursor-pointer w-full'
              onClick={() => toggleFAQ(index)}
            >
              <div className='flex items-center justify-between gap-4'>
                <Heading
                  as='h3'
                  content={faq.question}
                  className=' sm:text-lg font-semibold text-primary'
                />

                <span className='text-xl sm:text-2xl text-primary flex-shrink-0'>
                  {openIndex === index ? '−' : '+'}
                </span>
              </div>

              {openIndex === index && (
                <Typography className='text-gray-background  sm:text-lg font-medium'>
                  {faq.answer}
                </Typography>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export { FAQSection };
