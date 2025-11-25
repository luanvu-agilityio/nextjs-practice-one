'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';

// Icons
import { LogoIcon, ThemeSwitcherIcon } from '@/icons';

// Component
import {
  Button,
  Heading,
  Typography,
  Section,
  IconButton,
  Navbar,
} from '@/components/ui';
import { UserMenu } from '@/features/Auth';

// Constants
import { ROUTES } from '@/constants';

const HeroSection = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [showMobileAuth, setShowMobileAuth] = useState(false);

  const handleNavigation = () => {
    router.push(ROUTES.SERVICES);
  };

  const renderAuthSection = () => {
    if (isPending) {
      return (
        <div className='flex items-center gap-2 sm:gap-4'>
          <div className='w-20 h-10 bg-gray-200 rounded-lg animate-pulse' />
          <div className='w-20 h-10 bg-gray-200 rounded-lg animate-pulse' />
        </div>
      );
    }

    if (session?.user) {
      return <UserMenu />;
    }

    return (
      <>
        {/* Desktop Auth Buttons */}
        <div className='hidden sm:flex items-center gap-2 sm:gap-4'>
          <Link href={ROUTES.SIGN_IN} className='no-underline'>
            <Button variant='secondary' size='small'>
              Sign In
            </Button>
          </Link>
          <Link href={ROUTES.SIGN_UP} className='no-underline'>
            <Button variant='primary' size='small'>
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile User Icon Toggle */}
        <div className='mobile-auth-toggle relative'>
          <IconButton
            aria-label='Toggle auth menu'
            variant='ghost'
            size='md'
            onClick={() => setShowMobileAuth(!showMobileAuth)}
            className={`text-primary p-0 ${showMobileAuth ? 'bg-gray-100' : ''}`}
          >
            <User className='w-6 h-6' />
          </IconButton>

          {/* Mobile Auth Dropdown */}
          {showMobileAuth && (
            <>
              {/* Backdrop to close on click outside */}
              <div
                className='fixed inset-0 z-30'
                onClick={() => setShowMobileAuth(false)}
              />

              {/* Dropdown Menu */}
              <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40'>
                <Link
                  href={ROUTES.SIGN_IN}
                  className='no-underline block'
                  onClick={() => setShowMobileAuth(false)}
                >
                  <Button
                    variant='secondary'
                    size='small'
                    className='w-full mx-2 mb-2'
                    style={{ width: 'calc(100% - 1rem)' }}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link
                  href={ROUTES.SIGN_UP}
                  className='no-underline block'
                  onClick={() => setShowMobileAuth(false)}
                >
                  <Button
                    variant='primary'
                    size='small'
                    className='w-full mx-2'
                    style={{ width: 'calc(100% - 1rem)' }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </>
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
        <div className='max-w-[1296px] mx-auto py-4 px-4 sm:px-6 flex items-center gap-4 sm:gap-14'>
          <Link
            href='/'
            className='flex items-center gap-2 no-underline flex-shrink-0'
            aria-label='Homepage'
          >
            <LogoIcon className='w-6 h-6 sm:w-8 sm:h-8' />
            <span className='sr-only'>Homepage</span>
            <div className='hidden sm:block'>
              <Heading
                as='h1'
                size='md'
                content={
                  <span className='font-secondary text-primary text-xl sm:text-2xl lg:text-3xl font-light'>
                    SaaS<span className='font-medium'>Candy</span>
                  </span>
                }
              />
            </div>
          </Link>

          <Navbar />

          <div className='ml-auto flex items-center gap-2 sm:gap-4'>
            <ThemeSwitcherIcon className='w-8 h-8 sm:w-10 sm:h-10' />
            {renderAuthSection()}
          </div>
        </div>
      </header>

      <div className='max-w-[1296px] mx-auto px-4 sm:px-6 py-8 sm:py-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16'>
        <div className='space-y-4 sm:space-y-7.5 text-center lg:text-left'>
          <Heading
            as='h2'
            size='3xl'
            content='Build Innovative Apps For Your Business'
            className='text-primary max-w-lg text-3xl sm:text-5xl lg:text-7xl'
          />

          <Typography className='text-gray-background max-w-lg sm:text-lg font-regular'>
            Build smarter, move faster, and grow stronger with custom apps
            designed to support your business every step of the way.
          </Typography>

          <Button
            variant='primary'
            onClick={handleNavigation}
            className='w-full sm:w-auto'
          >
            Browse our services
          </Button>
        </div>

        <div className='flex justify-center lg:justify-end w-full lg:w-auto'>
          <Image
            src='/images/hero/banner.png'
            alt='Business dashboard stats'
            width={729}
            height={685}
            sizes='(max-width: 1024px) 100vw, 729px'
            priority
            className='rounded-xl w-full lg:max-w-none h-auto lg:h-[685px]'
          />
        </div>
      </div>
    </Section>
  );
};

export { HeroSection };
