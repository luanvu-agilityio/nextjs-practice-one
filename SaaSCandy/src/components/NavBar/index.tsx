'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';

// Components
import { IconButton } from '@/components/common/IconButton';

// Constants
import { NAV_LINKS } from '@/constants';

function Navbar(): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <nav className='flex-1'>
      <ul className='hidden md:flex items-center justify-start gap-10 text-primary w-full'>
        {NAV_LINKS.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className='font-regular hover:text-orange-background hover:font-semibold transition-colors'
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className='md:hidden flex items-center'>
        <IconButton
          aria-label='Toggle menu'
          variant='ghost'
          size='md'
          onClick={() => setOpen(v => !v)}
        >
          <svg
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            className='text-gray-700'
          >
            <path
              d={open ? 'M18 6L6 18M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'}
              stroke='currentColor'
              strokeWidth='1.6'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </IconButton>
      </div>

      {open && (
        <div className='absolute left-0 right-0 top-full bg-white shadow-md md:hidden z-40'>
          <ul className='flex flex-col gap-2 p-4 text-gray-700'>
            {NAV_LINKS.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className='block py-2 px-3 rounded hover:bg-gray-50'
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
