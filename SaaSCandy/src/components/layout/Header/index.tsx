'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { User } from 'lucide-react';

// Icons
import { LogoIcon, ThemeSwitcherIcon } from '@/icons';

// Components
import Navbar from '@/components/NavBar';
import { Button, Heading } from '@/components/common';
import { IconButton } from '@/components/common/IconButton';
import { UserMenu } from '@/components/UserMenu';
import AuthSectionSkeleton from './AuthSectionSkeleton';

// Constants
import { ROUTES } from '@/constants';

const Header = (): JSX.Element => {
  const { data: session, isPending } = useSession();
  const [showMobileAuth, setShowMobileAuth] = useState(false);

  const renderAuthSection = () => {
    if (isPending) {
      return <AuthSectionSkeleton />;
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
        <div className='lg:hidden relative'>
          <IconButton
            aria-label='Toggle auth menu'
            variant='ghost'
            size='md'
            onClick={() => setShowMobileAuth(!showMobileAuth)}
            className={`text-primary ${showMobileAuth ? 'bg-gray-100' : ''}`}
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
    <header className='bg-white w-full'>
      <div className='max-w-[1296px] mx-auto py-4 px-4 sm:px-6 lg:px-0 flex items-center gap-2 sm:gap-4 lg:gap-14'>
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

          {/* Auth section with toggle on mobile */}
          {renderAuthSection()}
        </div>
      </div>
    </header>
  );
};

Header.displayName = 'Header';
export { Header };
