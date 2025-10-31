'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';

// Components
import {
  Button,
  CheckboxController,
  Divider,
  Heading,
  Typography,
  Section,
  InputController,
  LazySection,
} from '@/components/common';

// Utils
import { JoinUsFormData, joinUsSchema } from '@/utils';

const JoinUsSection = () => {
  const { control, handleSubmit } = useForm<JoinUsFormData>({
    resolver: zodResolver(joinUsSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      agreeTerms: false,
    },
  });

  const onSubmit = (data: JoinUsFormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <>
      <LazySection
        bgImageUrl='/images/background/join-us.png'
        className='text-white relative overflow-hidden'
      >
        <div className='max-w-[1296px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16'>
          <div className='space-y-4 sm:space-y-7.5 max-w-full lg:max-w-126.75'>
            <div className='space-y-4 sm:space-y-7.5'>
              <Typography
                size='lg'
                className='text-orange-background font-semibold  sm:text-lg'
              >
                Join us Now
              </Typography>

              <Heading
                as='h2'
                size='2xl'
                content='Ready to try the product for free?'
                className='text-white max-w-full lg:max-w-lg text-2xl sm:text-5xl lg:text-6xl'
              />
            </div>

            <Divider text='' className='text-gray-background' />

            <div className='space-y-4 sm:space-y-7.5'>
              <Typography className='text-blue-foreground text-sm sm:text-md font-light'>
                Contrary to popular belief, Lorem Ipsum is not simply random
                text. It has roots in a piece.
              </Typography>

              <div className='flex items-center gap-3'>
                <Image
                  src='https://res.cloudinary.com/dhxpzzz5a/image/upload/v1760984406/avatar-6_bvm1tg.jpg'
                  alt='Merky Lester'
                  width={53}
                  height={53}
                  className='rounded-full w-12 h-12 sm:w-[53px] sm:h-[53px]'
                />
                <div>
                  <Typography className='text-white font-semibold  sm:text-lg'>
                    Merky Lester
                  </Typography>
                  <Typography className='text-blue-foreground  sm:text-lg font-medium'>
                    Managers
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-6 sm:space-y-8'
          >
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <InputController
                name='firstName'
                label='Full name'
                control={control}
                placeholder='Place holder'
                variant='secondary'
              />
              <InputController
                name='lastName'
                label='Full name'
                control={control}
                placeholder='Place holder'
                variant='secondary'
              />
            </div>

            <InputController
              name='email'
              label='Email address'
              control={control}
              type='email'
              placeholder='Enter your email address'
              variant='secondary'
            />

            <InputController
              name='password'
              label='Email Password'
              control={control}
              type='password'
              placeholder='Enter your password'
              variant='secondary'
              showPasswordToggle
            />

            <CheckboxController
              name='agreeTerms'
              control={control}
              aria-label='Agree to terms and conditions'
              label={
                <>
                  You agree to our{' '}
                  <span className='text-orange-background underline cursor-pointer'>
                    terms and conditions
                  </span>{' '}
                  of use.
                </>
              }
            />

            <Button variant='primary' type='submit' className='w-full'>
              Try for Free
            </Button>
          </form>
        </div>
      </LazySection>

      {/* Trust logos */}
      <Section className='bg-blue-background px-4 sm:px-6'>
        <div className='text-center'>
          <Typography className='text-white  sm:text-lg mb-6 sm:mb-10'>
            Trusted by content creators across the world
          </Typography>
          <div className='flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-18'>
            <Image
              src='/images/logo/google.svg'
              alt='Google Logo'
              width={88}
              height={30}
              className='h-6 sm:h-[30px] w-auto'
            />
            <Image
              src='/images/logo/microsoft.svg'
              alt='Microsoft Logo'
              width={128}
              height={30}
              className='h-6 sm:h-[30px] w-auto'
            />
            <Image
              src='/images/logo/amazon.svg'
              alt='Amazon Logo'
              width={94}
              height={32}
              className='h-6 sm:h-8 w-auto'
            />
            <Image
              src='/images/logo/unique.svg'
              alt='Unique Logo'
              width={97}
              height={30}
              className='h-6 sm:h-[30px] w-auto'
            />
          </div>
        </div>
      </Section>
    </>
  );
};

export { JoinUsSection };
