'use client';

import { useState } from 'react';
import { Button, Heading } from '@/components/common';
import { Input } from '../common/Input';

interface NewsletterSignupProps {
  className?: string;
}

function NewsletterSignup({ className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <div className={`${className}`}>
      <Heading
        as='h3'
        className='font-semibold text-primary text-2xl sm:text-3xl lg:text-[35px] mb-4 sm:mb-6'
        content='Join our Newsletter'
      />
      <form onSubmit={handleSubmit} className='space-y-3 sm:space-y-4'>
        <Input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Email address Subscribe'
          className='px-3 py-2 sm:px-4 sm:py-2.5 border border-primary rounded-lg text-sm sm:text-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full'
          required
        />
        <Button type='submit' variant='primary' className='rounded-lg w-full'>
          Subscribe
        </Button>
      </form>
    </div>
  );
}

export { NewsletterSignup };
