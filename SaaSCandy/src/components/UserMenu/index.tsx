'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ChevronDown, CircleUserRound, LogOut, Settings } from 'lucide-react';

// Shadcn Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Components
import { Typography } from '@/components/common';

// Utils & Constants
import { AUTH_ROUTES } from '@/constants';

interface UserMenuProps {
  className?: string;
}

function UserMenu({ className = '' }: Readonly<UserMenuProps>) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const {
    user: { name, email, image },
  } = session;

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: AUTH_ROUTES.HOME,
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const displayName = name || email || 'User';
  const firstName = displayName.split(' ')[0];
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-background focus:ring-offset-2'
            aria-label='User menu'
          >
            {/* User Avatar */}
            {image ? (
              <img
                src={image}
                alt='Profile'
                className='w-8 h-8 rounded-full border border-form-border-color object-cover'
              />
            ) : (
              <div className='w-8 h-8 rounded-full bg-orange-background flex items-center justify-center text-white text-sm font-medium'>
                {initials}
              </div>
            )}

            {/* User Name */}
            <span className='text-md font-semibold text-orange-background hidden sm:block'>
              Welcome, {firstName}
            </span>

            {/* Dropdown Arrow */}
            <ChevronDown className='w-4 h-4 text-gray-500' />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className='w-64 bg-white shadow-lg border border-gray-200 rounded-lg'
          align='end'
          side='bottom'
          sideOffset={8}
          alignOffset={0}
          avoidCollisions={true}
          collisionPadding={16}
        >
          {/* User Info Header */}
          <DropdownMenuLabel className='p-4'>
            <div className='flex items-center gap-3'>
              {image ? (
                <img
                  src={image}
                  alt='Profile'
                  className='w-10 h-10 rounded-full border border-gray-300 object-cover'
                />
              ) : (
                <div className='w-10 h-10 rounded-full bg-orange-background flex items-center justify-center text-white font-medium'>
                  {initials}
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <Typography className='text-sm font-medium text-gray-900 truncate'>
                  {displayName}
                </Typography>
                <Typography className='text-xs text-gray-500 truncate'>
                  {email}
                </Typography>
              </div>
            </div>
          </DropdownMenuLabel>

          {/* Menu Items */}
          <DropdownMenuItem
            asChild
            className='text-orange-background focus:text-orange-background focus:bg-orange-foreground'
          >
            <Link
              href='/account'
              className='flex items-center gap-3 cursor-pointer'
            >
              <CircleUserRound className='w-5 h-5' />
              <span>Account Details</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled
            className='text-orange-background focus:text-orange-background focus:bg-orange-foreground'
          >
            <div className='flex items-center gap-3'>
              <Settings className='w-5 h-5' />
              <span>Settings (Coming Soon)</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleSignOut}
            className='text-orange-background focus:text-orange-background focus:bg-orange-foreground'
          >
            <div className='flex items-center gap-3 cursor-pointer'>
              <LogOut className='w-5 h-5' />
              <span>Sign Out</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default UserMenu;
