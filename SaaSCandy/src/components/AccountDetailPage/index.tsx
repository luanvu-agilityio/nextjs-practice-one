'use client';

import { Fragment, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Components
import { Button, Heading, Typography } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/common/Breadcrumb';
import { Spinner } from '../ui/spinner';

// Icons
import LogoIcon from '@/components/icons/Logo';

// Utils & Constants
import { ROUTES } from '@/constants';

function AccountDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.SIGN_IN);
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const {
    user: { name, email, image },
  } = session;

  const handleGoBack = () => {
    router.back();
  };

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: ROUTES.HOME,
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Account', href: '/account', isActive: true },
  ];

  return (
    <div className='flex flex-col items-center max-w-[1296px] mx-auto min-h-screen py-8'>
      {/* Header Section */}
      <div className='pb-12 w-full'>
        <Heading
          as='h1'
          size='xl'
          content='Account Details'
          className='text-center'
        />

        {/* Breadcrumb */}
        <Breadcrumb className='justify-center mt-4'>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <Fragment key={item.label}>
                <BreadcrumbItem>
                  {item.isActive ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>
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

      {/* Account Detail Section */}
      <div className='py-14 px-16 w-full max-w-159 rounded-4xl border border-form-border-color shadow-form bg-white'>
        <div className='flex flex-col gap-10'>
          {/* Logo */}
          <div className='flex justify-center'>
            <Link href={ROUTES.HOME} className='flex items-center gap-3'>
              <LogoIcon className='w-10 h-10' />
              <span className='text-3xl font-secondary text-primary'>
                SaaS<span className='font-medium'>Candy</span>
              </span>
            </Link>
          </div>

          {/* User Information */}
          <div className='space-y-8'>
            {/* Profile Header */}
            <div className='text-center space-y-4'>
              {image ? (
                <div className='flex justify-center'>
                  <Link
                    href={image}
                    aria-label='Profile picture'
                    className='w-24 h-24 rounded-full border-4 border-orange-background'
                  />
                </div>
              ) : (
                <div className='flex justify-center'>
                  <div className='w-24 h-24 rounded-full bg-orange-background flex items-center justify-center text-white text-2xl font-bold'>
                    {name?.charAt(0) || email?.charAt(0) || 'U'}
                  </div>
                </div>
              )}

              <div>
                <Heading
                  as='h2'
                  size='md'
                  className='text-primary'
                  content={name || 'User'}
                />

                <Typography className='text-gray-background mt-1'>
                  {email}
                </Typography>
              </div>
            </div>

            {/* Account Information Cards */}
            <div className='space-y-4'>
              {/* Personal Information */}
              <div className='bg-blue-foreground opacity-80 rounded-lg p-6'>
                <Heading
                  as='h3'
                  size='md'
                  className='text-primary mb-4'
                  content='Personal Information'
                />

                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-blue-background font-bold'>
                      Name:
                    </span>
                    <span className='font-medium text-primary'>
                      {name || 'Not provided'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-blue-background font-bold'>
                      Email:
                    </span>
                    <span className='font-medium text-primary'>{email}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-blue-background font-bold'>
                      Account Type:
                    </span>
                    <span className='px-2 py-1 bg-blue-foreground text-blue-background rounded-full text-md'>
                      {image ? 'Social Account' : 'Email Account'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className='bg-blue-foreground opacity-80 rounded-lg p-6'>
                <Heading
                  as='h3'
                  size='md'
                  className='text-primary mb-4'
                  content='Account Settings'
                />

                <div className='space-y-3'>
                  <Button
                    variant='secondary'
                    className='w-full justify-start font-semibold'
                    disabled
                  >
                    Edit Profile (Coming Soon)
                  </Button>
                  <Button
                    variant='secondary'
                    className='w-full justify-start font-semibold'
                    disabled
                  >
                    Change Password (Coming Soon)
                  </Button>
                  <Button
                    variant='secondary'
                    className='w-full justify-start font-semibold'
                    disabled
                  >
                    Privacy Settings (Coming Soon)
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4 pt-6'>
              <Button
                variant='secondary'
                className='flex-1'
                onClick={handleGoBack}
              >
                Back
              </Button>
              <Button
                variant='tertiary'
                className='flex-1'
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDetailPage;
