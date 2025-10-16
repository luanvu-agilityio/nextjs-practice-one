'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Components
import { IconButton } from '@/components/common/IconButton';

// Constants
import { NAV_LINKS } from '@/constants';

function Navbar(): JSX.Element {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className='flex-1'>
      {/* Desktop Navigation */}
      <ul className='hidden lg:flex items-center justify-start gap-6 xl:gap-10 text-primary w-full'>
        {NAV_LINKS.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`font-regular text-sm xl:text-lg hover:text-orange-background transition-colors ${
                pathname === l.href ? 'text-orange-background' : ''
              }`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile Menu Button */}
      <div className='lg:hidden flex items-center'>
        <IconButton
          aria-label='Toggle menu'
          variant='ghost'
          size='md'
          onClick={() => setOpen(v => !v)}
          className='p-0'
        >
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            className='text-gray-700'
          >
            <path
              d={open ? 'M18 6L6 18M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'}
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </IconButton>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className='absolute left-0 right-0 top-full bg-white shadow-lg lg:hidden z-50 border-t border-gray-200'>
          <ul className='flex flex-col gap-0 p-0 text-gray-700'>
            {NAV_LINKS.map(l => (
              <li
                key={l.href}
                className='border-b border-gray-100 last:border-0'
              >
                <Link
                  href={l.href}
                  className={`block py-4 px-6 hover:bg-gray-50 transition-colors ${
                    pathname === l.href
                      ? 'bg-orange-50 text-orange-background font-semibold'
                      : ''
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
