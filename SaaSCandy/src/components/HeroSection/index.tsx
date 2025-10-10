'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

// Icons
import LogoIcon from '../icons/Logo';

// Component
import { Button, Heading, Typography } from '@/components/common';
import Section from '../common/Section';
import Navbar from '../NavBar';
import ThemeSwitcherIcon from '../icons/ThemeSwitcherIcon';
import AuthSectionSkeleton from '../layout/Header/AuthSectionSkeleton';
import UserMenu from '../UserMenu';

function HeroSection() {
  const { data: session, status } = useSession();
  const renderAuthSection = () => {
    if (status === 'loading') {
      return <AuthSectionSkeleton />;
    }

    if (session?.user) {
      return <UserMenu />;
    }

    return (
      <div className='hidden sm:flex items-center gap-4'>
        <Link href='/signin' className='no-underline'>
          <Button variant='secondary' size='small'>
            Sign In
          </Button>
        </Link>
        <Link href='/signup' className='no-underline'>
          <Button variant='primary' size='small'>
            Sign Up
          </Button>
        </Link>
      </div>
    );
  };
  return (
    <Section
      className='relative overflow-hidden'
      style={{
        backgroundImage: "url('/images/background/homepage.png')",
        backgroundSize: 'cover',
        padding: 0,
      }}
    >
      <header className='w-full relative z-10'>
        <div className='max-w-[1296px] mx-auto py-4 px-6 flex items-center gap-14'>
          <Link href='/' className='flex items-center gap-2 no-underline'>
            <LogoIcon className='w-8 h-8' />
            <div className='hidden sm:block'>
              <Heading
                as='h1'
                size='md'
                content={
                  <span className='font-secondary text-primary text-3xl font-light'>
                    SaaS<span className='font-medium'>Candy</span>
                  </span>
                }
              />
            </div>
          </Link>

          <Navbar />

          <div className='ml-auto flex items-center justify-between gap-4'>
            <ThemeSwitcherIcon className='w-10 h-10' />
            {renderAuthSection()}
          </div>
        </div>
      </header>
      <div className='max-w-[1296px] mx-auto flex items-center justify-between gap-16'>
        <div className='space-y-7.5'>
          <Heading
            as='h2'
            size='3xl'
            content='Build Innovative Apps For Your Business'
            className='text-primary max-w-lg'
          />

          <Typography className='text-gray-background max-w-lg text-lg font-regular'>
            Build smarter, move faster, and grow stronger with custom apps
            designed to support your business every step of the way.
          </Typography>

          <Button variant='primary'>Browse our services</Button>
        </div>

        <div className='flex justify-end'>
          <Image
            src='/images/hero/banner.png'
            alt='Business dashboard stats'
            width={729}
            height={685}
            className='rounded-xl'
          />
        </div>
      </div>
    </Section>
  );
}

export default HeroSection;
