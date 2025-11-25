'use client';

import { useState, JSX, memo } from 'react';
import Link from 'next/link';

// Components
import { Button, Heading, IconButton, Typography } from '@/components/ui';

// Icons
import { LogoIcon } from '@/icons/Logo';
import { ChevronDown } from 'lucide-react';

// Constants
import { NAV_LINKS, SOCIAL_LINKS } from '@/constants';

const Footer = memo((): JSX.Element => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className='bg-dark-blue w-full'>
      <div className='max-w-[1296px] mx-auto px-4 sm:px-6 lg:px-4 py-12 sm:py-16 lg:py-17.5'>
        {/* Main Footer Content */}
        <div className='flex flex-col lg:flex-row justify-between gap-12 lg:gap-33'>
          {/* Brand Section */}
          <div className='w-full lg:w-76.5 flex flex-col gap-8 lg:gap-13.5'>
            <Link
              href='/'
              className='flex items-center gap-2 no-underline'
              aria-label='Homepage'
            >
              <LogoIcon className='w-8 h-8' />
              <div>
                <Heading
                  as='h1'
                  size='md'
                  content={
                    <span className='font-secondary text-white text-2xl sm:text-3xl font-light'>
                      SaaS<span className='font-medium'>Candy</span>
                    </span>
                  }
                />
              </div>
            </Link>

            <div className='flex flex-col gap-6 lg:gap-6.5'>
              <Typography className='  sm:text-lg text-white opacity-50 font-medium'>
                Rakon is a simple, elegant, and secure way to build your bitcoin
                and crypto portfolio.
              </Typography>
              <Typography className='text-white   sm:text-lg font-medium'>
                1989 Don Jackson Lane
                <br />
                <span className='  sm:text-lg text-blue-foreground font-medium'>
                  Call us:{' '}
                  <span className='text-orange-background'>808-956-9599</span>
                </span>
              </Typography>
            </div>
          </div>

          {/* Links Section - Desktop */}
          <div className='hidden lg:grid grid-cols-3 gap-6   sm:text-lg flex-1'>
            {/* Services Column */}
            <div>
              <Heading
                as='h2'
                content='Services'
                className='text-white mb-10 font-medium   sm:text-lg'
              />
              <ul className='space-y-6   sm:text-lg font-medium text-white opacity-50'>
                <li>
                  <Link
                    href='/services/edtech'
                    className='hover:text-white hover:opacity-100 transition-opacity'
                  >
                    EdTech Apps
                  </Link>
                </li>
                <li>
                  <Link
                    href='/services/ecommerce'
                    className='hover:text-white hover:opacity-100 transition-opacity'
                  >
                    eCommerce Apps
                  </Link>
                </li>
                <li>
                  <Link
                    href='/services/crm'
                    className='hover:text-white hover:opacity-100 transition-opacity'
                  >
                    CRM Apps
                  </Link>
                </li>
                <li>
                  <Link
                    href='/services/health'
                    className='hover:text-white hover:opacity-100 transition-opacity'
                  >
                    Health Apps
                  </Link>
                </li>
                <li>
                  <Link
                    href='/services/analytics'
                    className='hover:text-white hover:opacity-100 transition-opacity'
                  >
                    Web Analytics Apps
                  </Link>
                </li>
                <li>
                  <Link
                    href='/services/banking'
                    className='hover:text-white hover:opacity-100 transition-opacity'
                  >
                    Banking Apps
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <Heading
                as='h2'
                content='Company'
                className='text-white   sm:text-lg mb-10 font-medium'
              />
              <ul className='space-y-6   sm:text-lg font-medium text-white opacity-50'>
                {NAV_LINKS.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className='hover:text-white hover:opacity-100 transition-opacity'
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscribe Column */}
            <div>
              <Heading
                as='h2'
                content='Subscribe'
                className='text-white mb-10 font-medium   sm:text-lg'
              />
              <Typography className='  sm:text-lg font-medium text-white opacity-50 mb-4'>
                Subscribe to get the latest news from us
              </Typography>
              <form className='flex flex-col gap-2.5'>
                <input
                  aria-label='Email'
                  type='email'
                  placeholder='Enter email address'
                  className='flex-1 rounded-lg bg-transparent border border-gray-700 px-3 py-2 text-sm placeholder-gray-400 text-white'
                />
                <Button variant='primary' size='small' className='w-full'>
                  Register
                </Button>
              </form>
            </div>
          </div>

          {/* Links Section - Mobile Accordion */}
          <div className='lg:hidden flex flex-col gap-4 w-full'>
            {/* Services Accordion */}
            <div className='border-b border-gray-700'>
              <button
                onClick={() => toggleSection('services')}
                className='w-full flex items-center justify-between py-4 text-white'
              >
                <Heading
                  as='h2'
                  content='Services'
                  className='text-white font-medium  '
                />
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    openSection === 'services' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openSection === 'services' && (
                <ul className='space-y-4 pb-4   font-medium text-white opacity-50'>
                  <li>
                    <Link
                      href='/services/edtech'
                      className='hover:text-white hover:opacity-100 transition-opacity'
                    >
                      EdTech Apps
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/services/ecommerce'
                      className='hover:text-white hover:opacity-100 transition-opacity'
                    >
                      eCommerce Apps
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/services/crm'
                      className='hover:text-white hover:opacity-100 transition-opacity'
                    >
                      CRM Apps
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/services/health'
                      className='hover:text-white hover:opacity-100 transition-opacity'
                    >
                      Health Apps
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/services/analytics'
                      className='hover:text-white hover:opacity-100 transition-opacity'
                    >
                      Web Analytics Apps
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/services/banking'
                      className='hover:text-white hover:opacity-100 transition-opacity'
                    >
                      Banking Apps
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Company Accordion */}
            <div className='border-b border-gray-700'>
              <button
                onClick={() => toggleSection('company')}
                className='w-full flex items-center justify-between py-4 text-white'
              >
                <Heading
                  as='h2'
                  content='Company'
                  className='text-white font-medium  '
                />
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    openSection === 'company' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openSection === 'company' && (
                <ul className='space-y-4 pb-4   font-medium text-white opacity-50'>
                  {NAV_LINKS.map(l => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className='hover:text-white hover:opacity-100 transition-opacity'
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Subscribe Accordion */}
            <div className='border-b border-gray-700'>
              <button
                onClick={() => toggleSection('subscribe')}
                className='w-full flex items-center justify-between py-4 text-white'
              >
                <Heading
                  as='h2'
                  content='Subscribe'
                  className='text-white font-medium  '
                />
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    openSection === 'subscribe' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openSection === 'subscribe' && (
                <div className='pb-4'>
                  <Typography className='  font-medium text-white opacity-50 mb-4'>
                    Subscribe to get the latest news from us
                  </Typography>
                  <form className='flex flex-col gap-2.5'>
                    <input
                      aria-label='Email'
                      type='email'
                      placeholder='Enter email address'
                      className='flex-1 rounded-lg bg-transparent border border-gray-700 px-3 py-2 text-sm placeholder-gray-400 text-white'
                    />
                    <Button variant='primary' size='small' className='w-full'>
                      Register
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className='relative mt-12 lg:mt-0 lg:pt-17.5'>
          <div className='  sm:text-lg font-medium text-white flex flex-col sm:flex-row items-center justify-between gap-6'>
            <span className='opacity-50 text-center sm:text-left'>
              ©{new Date().getFullYear()} - All Rights Reserved by GetNextJs
            </span>

            <nav
              className='flex gap-4 sm:gap-6'
              aria-label='Social media links'
            >
              {SOCIAL_LINKS.map(s => {
                const IconComponent = s.icon;
                return (
                  <IconButton key={s.href} variant='ghost' aria-label={s.label}>
                    <Link
                      href={s.href}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-block'
                      aria-label={s.label}
                    >
                      <IconComponent />
                    </Link>
                  </IconButton>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Fixed CTA Button */}
      <Link
        href='#'
        className='fixed right-4 bottom-4 sm:right-6 sm:bottom-6 lg:right-10 lg:bottom-10 bg-orange-background text-white text-sm sm:text-md font-semibold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg hover:bg-orange-600 transition-colors z-50'
      >
        <span className='hidden sm:inline'>Get This Template</span>
        <span className='sm:hidden'>Get Template</span>
      </Link>
    </footer>
  );
});

Footer.displayName = 'Footer';
export { Footer };
