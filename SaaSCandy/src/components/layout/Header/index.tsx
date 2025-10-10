'use client';

import { JSX } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Icons
import LogoIcon from '@/components/icons/Logo';
import ThemeSwitcherIcon from '@/components/icons/ThemeSwitcherIcon';

// Components
import Navbar from '@/components/NavBar';
import { Button, Heading } from '@/components/common';
import UserMenu from '@/components/UserMenu';
import AuthSectionSkeleton from './AuthSectionSkeleton';

function Header(): JSX.Element {
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
    <header className='bg-white w-full'>
      <div className='max-w-[1296px] mx-auto py-4 px-0 flex items-center gap-14'>
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

          {/* Conditional rendering based on authentication status */}
          {renderAuthSection()}
        </div>
      </div>
    </header>
  );
}

export default Header;
