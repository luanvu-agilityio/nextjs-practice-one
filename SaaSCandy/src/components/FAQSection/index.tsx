'use client';

import { useState } from 'react';

// Constants
import { faqData } from '@/constants';

// Components
import { Heading, Typography } from '@/components/common';
import Section from '../common/Section';

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section className='bg-white'>
      <div className='mx-auto space-y-20'>
        <div className='text-center space-y-7.5'>
          <Typography size='lg' className='text-gray-background font-semibold'>
            Frequently Asked Questions
          </Typography>
          <Heading
            as='h2'
            size='2xl'
            content='Want to ask something from us?'
            className='text-primary'
          />
        </div>

        <div className='grid md:grid-cols-2 gap-x-6 gap-y-4'>
          {faqData.map((faq, index) => (
            <div
              key={index}
              className='bg-light-gray rounded-[10px] py-6 px-7.5 space-y-6 cursor-pointer w-full'
              onClick={() => toggleFAQ(index)}
            >
              <div className='flex items-center justify-between'>
                <Heading
                  as='h3'
                  content={faq.question}
                  className='text-lg font-semibold text-primary'
                />

                <span className='text-2xl text-primary'>
                  {openIndex === index ? '−' : '−'}
                </span>
              </div>

              {openIndex === index && (
                <Typography className='text-gray-background text-lg font-medium'>
                  {faq.answer}
                </Typography>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default FAQSection;
