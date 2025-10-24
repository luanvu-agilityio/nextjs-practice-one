'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Components
import { Heading } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/common/Breadcrumb';
import { ForgotPasswordForm } from '@/components/form';

// Icons
import { LogoIcon } from '@/icons/Logo';

// Constants
import { AUTH_MESSAGES, ROUTES } from '@/constants';

// Utils

import { extractBreadcrumbs } from '@/utils';

const ForgotPasswordPageContent = () => {
  const pathname = usePathname();

  const breadcrumbs = extractBreadcrumbs(pathname);

  return (
    <div className='flex flex-col items-center max-w-[1296px] mx-auto px-4 sm:px-6'>
      {/* Header Section */}
      <div className='pb-8 sm:pb-12 text-center'>
        <Heading
          as='h2'
          size='xl'
          content={AUTH_MESSAGES.SIGN_IN.title}
          className='text-3xl sm:text-5xl lg:text-6xl'
        />

        <Breadcrumb className='justify-center mt-3 sm:mt-4'>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <Fragment key={item.label}>
                <BreadcrumbItem>
                  {item.isActive ? (
                    <BreadcrumbPage className='text-sm sm:xs'>
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href} className='text-sm sm:xs'>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Form Section */}
      <div className='py-8 px-4 sm:py-14 sm:px-16 w-full lg:w-159 rounded-2xl sm:rounded-4xl border border-form-border-color shadow-form'>
        <div className='flex flex-col gap-6 sm:gap-10'>
          {/* Logo */}
          <div className='flex justify-center'>
            <Link
              href={ROUTES.HOME}
              className='flex items-center gap-2 sm:gap-3'
            >
              <LogoIcon className='w-8 h-8 sm:w-10 sm:h-10' />
              <span className='text-2xl sm:text-3xl font-secondary text-primary'>
                SaaS<span className='font-medium'>Candy</span>
              </span>
            </Link>
          </div>

          <div className='flex flex-col gap-6 sm:gap-8'>
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export { ForgotPasswordPageContent };
