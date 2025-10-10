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
} from '@/components/common';
import { InputController } from '@/components/common/InputController';
import Section from '../common/Section';

// Utils
import { JoinUsFormData, joinUsSchema } from '@/utils';

function JoinUsSection() {
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
      <Section
        className='text-white relative overflow-hidden'
        style={{
          backgroundImage: "url('/images/background/join-us.png')",
          backgroundSize: 'cover',
        }}
      >
        <div className='max-w-[1296px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 '>
          <div className='space-y-7.5 max-w-126.75'>
            <div className='space-y-7.5'>
              <Typography
                size='lg'
                className='text-orange-background font-semibold'
              >
                Join us Now
              </Typography>

              <Heading
                as='h2'
                size='2xl'
                content='Ready to try the product for free?'
                className='text-white max-w-lg'
              />
            </div>

            <Divider text='' className='text-gray-background' />

            <div className='space-y-7.5'>
              <Typography className='text-blue-foreground text-md font-light'>
                Contrary to popular belief, Lorem Ipsum is not simply random
                text. It has roots in a piece.
              </Typography>

              <div className='flex items-center gap-3'>
                <Image
                  src='/images/avatar/merky-lester.png'
                  alt='Merky Lester'
                  width={53}
                  height={53}
                  className='rounded-full'
                />
                <div>
                  <Typography className='text-white font-semibold text-lg'>
                    Merky Lester
                  </Typography>
                  <Typography className='text-blue-foreground text-lg font-medium'>
                    Managers
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-2 gap-4'>
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

            <Button variant='primary' type='submit'>
              Try for Free
            </Button>
          </form>
        </div>
      </Section>

      {/* Trust logos */}
      <Section className='bg-blue-background'>
        <div className='text-center'>
          <Typography className='text-white text-lg mb-10'>
            Trusted by content creators across the world
          </Typography>
          <div className='flex justify-center items-center gap-18'>
            <Image
              src='/images/logo/google.svg'
              alt='Google Logo'
              width={88}
              height={30}
            />
            <Image
              src='/images/logo/microsoft.svg'
              alt='Microsoft Logo'
              width={128}
              height={30}
            />
            <Image
              src='/images/logo/amazon.svg'
              alt='Amazon Logo'
              width={94}
              height={32}
            />
            <Image
              src='/images/logo/unique.svg'
              alt='Unique Logo'
              width={97}
              height={30}
            />
          </div>
        </div>
      </Section>
    </>
  );
}

export default JoinUsSection;
