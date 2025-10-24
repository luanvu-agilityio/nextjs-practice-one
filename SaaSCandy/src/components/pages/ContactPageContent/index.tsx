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
  Section,
  showToast,
} from '@/components/common';

// Icons
import { EmailIcon, AddressIcon } from '@/icons';

// Utils
import { ContactFormData, contactSchema } from '@/utils';
import { getFriendlyMessage } from '@/components/common/ErrorMessage';

const ContactPageContent = () => {
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
        description:
          getFriendlyMessage(error) ||
          'Please try again or contact us directly.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Contact Info Section */}
      <Section className='bg-white'>
        <div className='flex flex-col items-center gap-8 sm:gap-12 lg:gap-16'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 w-full'>
            {/* Email Contact */}
            <div className='flex items-start gap-3 sm:gap-4'>
              <EmailIcon
                width={48}
                height={48}
                className='w-12 h-12 sm:w-16 sm:h-16 lg:w-17 lg:h-17 flex-shrink-0'
              />
              <div className='space-y-3 sm:space-y-4 lg:space-y-5'>
                <Typography
                  size='xl'
                  className='font-bold text-lg sm:text-xl lg:text-2xl'
                >
                  Email Us
                </Typography>
                <div className='space-y-1'>
                  <Typography className='text-gray-background text-sm sm:xs lg:text-lg font-regular'>
                    Feel free to contact us at
                  </Typography>
                  <Typography className='text-gray-background text-sm sm:xs lg:text-lg font-regular break-words'>
                    info@saascandy.com
                  </Typography>
                  <Typography className='text-gray-background text-sm sm:xs lg:text-lg font-regular'>
                    We respond promptly
                  </Typography>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className='flex items-start gap-3 sm:gap-4'>
              <AddressIcon
                width={48}
                height={48}
                className='w-12 h-12 sm:w-16 sm:h-16 lg:w-17 lg:h-17 flex-shrink-0'
              />
              <div className='space-y-3 sm:space-y-4 lg:space-y-5'>
                <Typography
                  size='xl'
                  className='font-bold text-lg sm:text-xl lg:text-2xl'
                >
                  Address
                </Typography>
                <div className='space-y-1'>
                  <Typography className='text-gray-background text-sm sm:text-xs lg:text-lg font-regular'>
                    2118 Beaver St, London NW1 5XG,
                  </Typography>
                  <Typography className='text-gray-background text-sm sm:text-xs lg:text-lg font-regular'>
                    United Kingdom
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Map Image */}
          <div className='w-full'>
            <Image
              src='/images/hero/map.png'
              alt='Company address'
              width={1170}
              height={446}
              className='w-full h-auto rounded-lg sm:rounded-xl'
            />
          </div>
        </div>
      </Section>

      {/* Contact Form Section */}
      <Section className='bg-white'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-7.5 items-start lg:items-center'>
          {/* Form */}
          <div className='space-y-6 sm:space-y-8 lg:space-y-9 order-2 lg:order-1'>
            <Heading
              as='h4'
              content='Get Online Consultation'
              size='xl'
              className='max-w-full lg:max-w-70 text-2xl sm:text-3xl lg:text-4xl'
            />
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='space-y-4 sm:space-y-5'
            >
              {/* Name and Project Name Row */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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

              {/* Email and Project Type Row */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputController
                  name='email'
                  control={control}
                  label='Email address*'
                  placeholder='Enter your email'
                  type='email'
                />

                <div>
                  <label
                    htmlFor='contact-project-type'
                    className='block text-sm sm:text-xs font-medium text-primary mb-2'
                  >
                    Project*
                  </label>
                  <select
                    id='contact-project-type'
                    className='w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-background focus:border-orange-background'
                    {...control.register('projectType')}
                  >
                    <option value=''>Choose the type of work</option>
                    <option value='web-development'>Web Development</option>
                    <option value='mobile-app'>Mobile App</option>
                    <option value='design'>UI/UX Design</option>
                    <option value='consultation'>Consultation</option>
                  </select>
                  {errors.projectType && (
                    <Typography className='mt-1 text-sm sm:text-md text-destructive'>
                      {errors.projectType.message}
                    </Typography>
                  )}
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor='contact-message'
                  className='block text-sm sm:text-xs font-medium text-primary mb-2'
                >
                  Message*
                </label>
                <textarea
                  id='contact-message'
                  placeholder='Briefly describe your requirements'
                  rows={4}
                  className='w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-xs border border-primary rounded-lg focus:ring-2 focus:ring-orange-background focus:border-orange-background resize-none'
                  {...control.register('message')}
                ></textarea>
                {errors.message && (
                  <Typography className='mt-1 text-sm sm:text-md text-destructive'>
                    {errors.message.message}
                  </Typography>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type='submit'
                disabled={isSubmitting}
                variant='primary'
                className='w-full sm:w-auto'
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </Button>
            </form>
          </div>

          {/* Office Image */}
          <div className='w-full order-1 lg:order-2'>
            <Image
              src='/images/hero/contact.png'
              alt='Company image'
              width={570}
              height={570}
              className='w-full h-auto rounded-lg sm:rounded-xl max-w-md lg:max-w-none mx-auto'
            />
          </div>
        </div>
      </Section>
    </>
  );
};

export { ContactPageContent };
