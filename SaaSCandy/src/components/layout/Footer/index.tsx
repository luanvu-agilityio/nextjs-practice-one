'use client';

import { Button, Heading, IconButton, Typography } from '@/components/common';
import LogoIcon from '@/components/icons/Logo';
import { NAV_LINKS, SOCIAL_LINKS } from '@/constants';

import Link from 'next/link';
import { JSX } from 'react';

export default function Footer(): JSX.Element {
  return (
    <footer className='bg-dark-blue w-full '>
      <div className='max-w-[1296px] mx-auto px-0 py-17.5 flex justify-between gap-33'>
        <div className='w-76.5 flex flex-col gap-13.5'>
          <Link href='/' className='flex items-center gap-2 no-underline'>
            <LogoIcon className='w-8 h-8' />

            <div className='hidden sm:block'>
              <Heading
                as='h1'
                size='md'
                content={
                  <span className='font-secondary text-white text-3xl font-light'>
                    SaaS<span className='font-medium'>Candy</span>
                  </span>
                }
              />
            </div>
          </Link>
          <div className='flex flex-col gap-6.5'>
            <Typography className='text-lg text-white opacity-50 font-medium'>
              Rakon is a simple, elegant, and secure way to build your bitcoin
              and crypto portfolio.
            </Typography>
            <Typography className='text-white text-lg font-medium'>
              1989 Don Jackson Lane
              <br />
              <span className='text-lg text-blue-foreground font-medium'>
                Call us:{' '}
                <span className='text-orange-background'>808-956-9599</span>
              </span>
            </Typography>
          </div>
        </div>
        <div className='flex justify-between  gap-6 text-lg '>
          <div className='w-48'>
            <Heading
              as='h4'
              content='Services'
              className='text-white mb-10 font-medium text-lg'
            />
            <ul className='space-y-6 text-lg font-medium text-white hover:text-white opacity-50'>
              <li>
                <Link href='/services/edtech' className='hover:text-white'>
                  EdTech Apps
                </Link>
              </li>
              <li>
                <Link href='/services/ecommerce' className='hover:text-white'>
                  eCommerce Apps
                </Link>
              </li>
              <li>
                <Link href='/services/crm' className='hover:text-white'>
                  CRM Apps
                </Link>
              </li>
              <li>
                <Link href='/services/health' className='hover:text-white'>
                  Health Apps
                </Link>
              </li>
              <li>
                <Link href='/services/analytics' className='hover:text-white'>
                  Web Analytics Apps
                </Link>
              </li>
              <li>
                <Link href='/services/banking' className='hover:text-white'>
                  Banking Apps
                </Link>
              </li>
            </ul>
          </div>

          <div className='w-48'>
            <Heading
              as='h4'
              content='Company'
              className='text-white text-lg mb-10 font-medium '
            />
            <ul className='space-y-6 text-lg font-medium text-white opacity-50 hover:text-white'>
              {NAV_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className='hover:text-white'>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className='w-104'>
            <Heading
              as='h4'
              content='Subscribe'
              className='text-white mb-10 font-medium text-lg'
            />
            <Typography className='text-lg font-medium text-white opacity-50 mb-4'>
              Subscribe to get the latest news from us
            </Typography>
            <form className='flex gap-2.5'>
              <input
                aria-label='Email'
                type='email'
                placeholder='Enter email address'
                className='flex-1 rounded-lg bg-transparent border border-gray-700 px-3 py-2 text-sm placeholder-gray-400'
              />
              <Button variant='primary' size='small'>
                Register
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className='relative max-w-[1296px] mx-auto pb-17.5'>
        <div className='text-lg font-medium text-white flex items-center justify-between'>
          <span className='opacity-50'>
            ©{new Date().getFullYear()} - All Rights Reserved by GetNextJs
          </span>

          <div className='flex gap-6' aria-label='Social media links'>
            {SOCIAL_LINKS.map(s => {
              const IconComponent = s.icon;
              return (
                <IconButton key={s.href} variant='ghost'>
                  <Link
                    href={s.href}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-block'
                  >
                    <IconComponent />
                  </Link>
                </IconButton>
              );
            })}
          </div>
        </div>
      </div>

      <Link
        href='#'
        className='fixed right-10 bottom-10 bg-orange-background text-white text-md font-semibold px-4 py-2.5 rounded-xl'
      >
        Get This Template
      </Link>
    </footer>
  );
}
