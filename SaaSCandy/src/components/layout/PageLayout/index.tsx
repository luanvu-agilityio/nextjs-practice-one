'use client';

import { Fragment, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { User } from 'lucide-react';

// Icons
import { LogoIcon, ThemeSwitcherIcon } from '@/icons';

// Components
import { Heading, Typography, Button } from '@/components/common';
import { IconButton } from '@/components/common/IconButton';
import Navbar from '@/components/NavBar';
import { UserMenu } from '@/components/UserMenu';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/common/Breadcrumb';

// Utils
import { extractBreadcrumbs } from '@/utils';
import { ROUTES } from '@/constants';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  breadcrumbOverride?: Array<{
    label: string;
    href: string;
    isActive: boolean;
  }>;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const PageLayout = ({
  title,
  subtitle,
  children,
  breadcrumbOverride,
  className = '',
  headerClassName = '',
  contentClassName = '',
}: PageLayoutProps) => {
  const pathname = usePathname();
  const breadcrumbs = breadcrumbOverride || extractBreadcrumbs(pathname);
  const { data: session } = useSession();
  const [showMobileAuth, setShowMobileAuth] = useState(false);

  const renderAuthSection = () => {
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
        <div className='sm:hidden relative'>
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
    <div className={`${className}`}>
      {/* Hero Header Section with integrated Header */}
      <div
        className={`relative text-white ${headerClassName}`}
        style={{
          backgroundImage: "url('/images/background/heading-background.png')",
          backgroundSize: 'cover',
        }}
      >
        {/* Header Navigation */}
        <header className='w-full relative z-10'>
          <div className='max-w-[1296px] mx-auto py-4 px-4 sm:px-6 lg:px-0 flex items-center gap-4 sm:gap-8 lg:gap-14'>
            <Link
              href='/'
              className='flex items-center gap-2 no-underline flex-shrink-0'
            >
              <LogoIcon className='w-6 h-6 sm:w-8 sm:h-8' />
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

        {/* Page Content */}
        <div className='relative flex flex-col lg:flex-row items-start lg:items-center justify-between max-w-[1296px] mx-auto px-4 sm:px-6 lg:px-0 pb-12 sm:pb-16 pt-12 sm:pt-20 lg:pt-29.25 gap-8'>
          {/* Left Content */}
          <div className='space-y-4 sm:space-y-6 lg:space-y-8 w-full lg:w-auto'>
            <Heading
              as='h2'
              size='xl'
              content={title}
              className='text-primary font-bold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl'
            />
            {subtitle && (
              <Typography
                size='lg'
                content={subtitle}
                className='text-gray-background leading-relaxed max-w-full lg:max-w-132 sm:text-lg min-h-21'
              />
            )}
          </div>

          {/* Right Breadcrumb */}
          <Breadcrumb className='w-full lg:w-auto lg:flex-shrink-0'>
            <BreadcrumbList className='flex-wrap'>
              {breadcrumbs.map((item, index) => (
                <Fragment key={item.label}>
                  <BreadcrumbItem>
                    {item.isActive ? (
                      <BreadcrumbPage className='text-white font-medium text-sm sm:text-xs'>
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={item.href}
                        className='text-blue-foreground hover:text-white transition-colors text-sm sm:text-xs'
                      >
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className='text-white' />
                  )}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className={`bg-inactive-background ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

PageLayout.displaName = 'PageLayout';
export { PageLayout };
