'use client';
import { Heading } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/common/Breadcrumb';
import { AUTH_MESSAGES } from '@/constants/messages';
import { extractBreadcrumbs } from '@/utils';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

const SignInHeader = () => {
  const pathname = usePathname();
  const breadcrumbs = extractBreadcrumbs(pathname);

  return (
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
  );
};

export { SignInHeader };
