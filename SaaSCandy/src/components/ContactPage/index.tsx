'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';

// Components
import {
  Button,
  Heading,
  InputController,
  Typography,
} from '@/components/common';
import { showToast } from '@/components/common/Toast';
import Section from '../common/Section';

// Icons
import EmailIcon from '../icons/Email';
import AddressIcon from '../icons/Address';

// Utils
import { ContactFormData, contactSchema } from '@/utils';

function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      projectName: '',
      projectType: '',
      message: '',
    },
  });

  const onSubmit = async (_data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      showToast({
        title: 'Message Sent Successfully!',
        description: "Thank you for contacting us. We'll get back to you soon.",
        variant: 'success',
      });

      reset();
    } catch (error) {
      showToast({
        title: 'Failed to Send Message',
        description: 'Please try again or contact us directly.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Contact Info Section */}
      <Section className='bg-white flex flex-col items-center gap-16'>
        <div className='flex flex-col items-center gap-16'>
          <div className='grid md:grid-cols-2 gap-20 items-center px-16 '>
            {/* Email Contact */}
            <div className='flex items-start gap-4'>
              <EmailIcon width={68} height={68} />
              <div className='space-y-5'>
                <Typography size='xl' className='font-bold'>
                  Email Us
                </Typography>
                <div>
                  <Typography className='text-gray-background text-lg font-regular'>
                    Feel free to contact us at
                  </Typography>
                  <Typography className='text-gray-background text-lg font-regular'>
                    info@saascandy.com
                  </Typography>
                  <Typography className='text-gray-background text-lg font-regular'>
                    We respond promptly
                  </Typography>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className='flex items-start gap-4'>
              <AddressIcon width={68} height={68} />
              <div className='space-y-5'>
                <Typography size='xl' className='font-bold'>
                  Address
                </Typography>
                <div>
                  <Typography className='text-gray-background text-lg font-regular'>
                    2118 Beaver St, London NW1 5XG,
                  </Typography>
                  <Typography className='text-gray-background text-lg font-regular'>
                    United Kingdom
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          <Image
            src='/images/hero/map.png'
            alt='Company address'
            width={1170}
            height={446}
          />
        </div>
      </Section>

      {/* Contact Form Section */}
      <Section className='bg-white '>
        <div className='grid lg:grid-cols-2 gap-7.5 items-center px-16'>
          {/* Form */}
          <div className='space-y-9'>
            <Heading
              as='h4'
              content='Get Online Consultation'
              size='xl'
              className='max-w-70'
            />
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid md:grid-cols-2 gap-4'>
                <InputController
                  name='name'
                  control={control}
                  label='User Name*'
                  placeholder='Enter your name'
                />

                <InputController
                  name='projectName'
                  control={control}
                  label='Project Name*'
                  placeholder='Enter project name'
                />
              </div>

              <div className='grid md:grid-cols-2 gap-6'>
                <InputController
                  name='email'
                  control={control}
                  label='Email address*'
                  placeholder='Enter your email'
                  type='email'
                />

                <div>
                  <label className='block text-sm font-medium text-primary mb-2'>
                    Project*
                  </label>
                  <select
                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-background focus:border-orange-background'
                    {...control.register('projectType')}
                  >
                    <option value=''>Choose the type of work</option>
                    <option value='web-development'>Web Development</option>
                    <option value='mobile-app'>Mobile App</option>
                    <option value='design'>UI/UX Design</option>
                    <option value='consultation'>Consultation</option>
                  </select>
                  {errors.projectType && (
                    <Typography className='mt-1 text-md text-destructive'>
                      {errors.projectType.message}
                    </Typography>
                  )}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-primary mb-2'>
                  Label
                </label>
                <textarea
                  name='message'
                  placeholder='Briefly describe your requirements'
                  rows={3}
                  className='w-full px-4 py-2.5 border border-primary rounded-lg focus:ring-2 focus:ring-orange-background focus:border-orange-background'
                ></textarea>
              </div>

              <Button type='submit' disabled={isSubmitting} variant='primary'>
                {isSubmitting ? 'Sending...' : 'Submit'}
              </Button>
            </form>
          </div>

          {/* Office Image */}
          <Image
            src='/images/hero/contact.png'
            alt='Company image'
            width={570}
            height={570}
          />
        </div>
      </Section>
    </>
  );
}

export default ContactPage;
