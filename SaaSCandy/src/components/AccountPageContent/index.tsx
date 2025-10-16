'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
import { Spinner } from '@/components';
import { showToast } from '@/components/common/Toast';
import EditProfileModal from '../EditProfileModal';
import ChangePasswordModal from '../ChangePasswordModal';

// Icons
import LogoIcon from '@/components/icons/Logo';

// Utils & Constants
import { ROUTES, TOAST_MESSAGES } from '@/constants';

// Types
import { TOAST_VARIANTS } from '@/types/toast';

function AccountPageContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(ROUTES.SIGN_IN);
    }
  }, [router, session?.user, isPending]);

  if (isPending) {
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
      await signOut();
      router.push(ROUTES.HOME);
      router.refresh();
      showToast({
        ...TOAST_MESSAGES.ACCOUNT.SIGNOUT_SUCCESS,
        variant: TOAST_VARIANTS.SUCCESS,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      showToast({
        ...TOAST_MESSAGES.ACCOUNT.SIGNOUT_ERROR,
        variant: TOAST_VARIANTS.ERROR,
      });
    }
  };

  const handleEditProfileSuccess = () => {
    showToast({
      ...TOAST_MESSAGES.ACCOUNT.PROFILE_UPDATE_SUCCESS,
      variant: TOAST_VARIANTS.SUCCESS,
    });
  };

  const handleChangePasswordSuccess = () => {
    showToast({
      ...TOAST_MESSAGES.ACCOUNT.PASSWORD_CHANGE_SUCCESS,
      variant: TOAST_VARIANTS.SUCCESS,
    });
  };

  const breadcrumbs = [
    { label: 'Home', href: ROUTES.HOME, isActive: false },
    { label: 'Account', href: ROUTES.ACCOUNT, isActive: true },
  ];

  const isSocialAccount = !!image;

  return (
    <>
      <div className='flex flex-col items-center max-w-[1296px] mx-auto min-h-screen py-4 sm:py-8 px-4 sm:px-6'>
        {/* Header Section  */}
        <div className='pb-6 sm:pb-12 w-full'>
          <Heading
            as='h1'
            size='xl'
            content='Account Details'
            className='text-center text-2xl sm:text-3xl lg:text-4xl'
          />

          {/* Breadcrumb */}
          <Breadcrumb className='justify-center mt-2 sm:mt-4'>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <Fragment key={item.label}>
                  <BreadcrumbItem>
                    {item.isActive ? (
                      <BreadcrumbPage className='text-sm sm:text-xs'>
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={item.href}
                        className='text-sm sm:text-xs'
                      >
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

        {/* Account Detail Section  */}
        <div className='py-8 px-4 sm:py-14 sm:px-16 w-full lg:max-w-159 rounded-2xl sm:rounded-4xl border border-form-border-color shadow-form bg-white'>
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

            {/* User Information */}
            <div className='space-y-6 sm:space-y-8'>
              {/* Profile Header  */}
              <div className='text-center space-y-3 sm:space-y-4'>
                {image ? (
                  <div className='flex justify-center'>
                    <Image
                      src={image}
                      alt='Profile picture'
                      width={96}
                      height={96}
                      className='w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-orange-background object-cover'
                    />
                  </div>
                ) : (
                  <div className='flex justify-center'>
                    <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-background flex items-center justify-center text-white text-xl sm:text-2xl font-bold'>
                      {name?.charAt(0) || email?.charAt(0) || 'U'}
                    </div>
                  </div>
                )}

                <div>
                  <Heading
                    as='h2'
                    size='md'
                    className='text-primary text-xl sm:text-2xl'
                    content={name || 'User'}
                  />

                  <Typography className='text-gray-background mt-1 text-sm sm:text-xs break-all'>
                    {email}
                  </Typography>
                </div>
              </div>

              {/* Account Information Cards */}
              <div className='space-y-3 sm:space-y-4'>
                {/* Personal Information */}
                <div className='bg-blue-foreground opacity-80 rounded-lg p-4 sm:p-6'>
                  <Heading
                    as='h3'
                    size='md'
                    className='text-primary mb-3 sm:mb-4 text-lg sm:text-xl'
                    content='Personal Information'
                  />

                  <div className='space-y-2 sm:space-y-3'>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0  sm:text-lg'>
                      <span className='text-blue-background font-bold'>
                        Name:
                      </span>
                      <span className='font-medium text-primary'>
                        {name || 'Not provided'}
                      </span>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0  sm:text-lg'>
                      <span className='text-blue-background font-bold'>
                        Email:
                      </span>
                      <span className='font-medium text-primary break-all'>
                        {email}
                      </span>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 sm:text-lg'>
                      <span className='text-blue-background font-bold'>
                        Account Type:
                      </span>
                      <span className='px-2 py-1 bg-blue-foreground text-blue-background rounded-full text-sm sm:text-md inline-block w-fit'>
                        {isSocialAccount ? 'Social Account' : 'Email Account'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className='bg-blue-foreground opacity-80 rounded-lg p-4 sm:p-6'>
                  <Heading
                    as='h3'
                    size='md'
                    className='text-primary mb-3 sm:mb-4 text-lg sm:text-xl'
                    content='Account Settings'
                  />

                  <div className='space-y-2 sm:space-y-3'>
                    <Button
                      variant='secondary'
                      className='w-full justify-start font-semibold sm:text-lg'
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      Edit Profile
                    </Button>

                    <Button
                      variant='secondary'
                      className='w-full justify-start font-semibold  sm:text-lg'
                      onClick={() => setIsChangePasswordOpen(true)}
                      disabled={isSocialAccount}
                    >
                      <span className='block sm:inline'>Change Password</span>
                      {isSocialAccount && (
                        <span className='block sm:inline text-xs sm:text-sm ml-0 sm:ml-1 mt-1 sm:mt-0'>
                          (Not available for social accounts)
                        </span>
                      )}
                    </Button>

                    <Button
                      variant='secondary'
                      className='w-full justify-start font-semibold  sm:text-lg'
                      disabled
                    >
                      Privacy Settings (Coming Soon)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons  */}
              <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6'>
                <Button
                  variant='secondary'
                  className='flex-1 w-full  sm:text-lg'
                  onClick={handleGoBack}
                >
                  Back
                </Button>
                <Button
                  variant='tertiary'
                  className='flex-1 w-full  sm:text-lg'
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        onSuccess={handleEditProfileSuccess}
      />

      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        onSuccess={handleChangePasswordSuccess}
      />
    </>
  );
}

export default AccountPageContent;
