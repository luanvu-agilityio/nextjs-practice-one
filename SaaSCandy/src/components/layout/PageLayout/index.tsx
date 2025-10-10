'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Icons
import LogoIcon from '@/components/icons/Logo';
import ThemeSwitcherIcon from '@/components/icons/ThemeSwitcherIcon';

// Components
import { Heading, Typography, Button } from '@/components/common';
import Navbar from '@/components/NavBar';
import UserMenu from '@/components/UserMenu';
import AuthSectionSkeleton from '../Header/AuthSectionSkeleton';
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

function PageLayout({
  title,
  subtitle,
  children,
  breadcrumbOverride,
  className = '',
  headerClassName = '',
  contentClassName = '',
}: PageLayoutProps) {
  const pathname = usePathname();
  const breadcrumbs = breadcrumbOverride || extractBreadcrumbs(pathname);
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

        {/* Page Content */}
        <div className='relative flex items-center justify-between max-w-[1296px] mx-auto pb-16 pt-29.25'>
          {/* Left Content */}
          <div className='space-y-8'>
            <Heading
              as='h2'
              size='xl'
              content={title}
              className='text-primary font-bold '
            />
            {subtitle && (
              <Typography
                size='lg'
                content={subtitle}
                className='text-gray-background leading-relaxed max-w-132'
              />
            )}
          </div>

          {/* Right Breadcrumb */}

          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.label}>
                  <BreadcrumbItem>
                    {item.isActive ? (
                      <BreadcrumbPage className='text-white font-medium'>
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={item.href}
                        className='text-blue-foreground hover:text-white transition-colors'
                      >
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className='text-white' />
                  )}
                </React.Fragment>
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
}

export default PageLayout;
