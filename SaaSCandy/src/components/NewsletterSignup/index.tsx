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
        className='font-semibold text-primary text-[35px]'
        content='Join our Newsletter'
      />
      <form onSubmit={handleSubmit} className='space-y-4'>
        <Input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Email address Subscribe'
          className='px-4 py-2.5 border border-primary rounded-lg text-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
          required
        />
        <Button
          type='submit'
          variant='primary'
          className={`rounded-lg ${className}`}
        >
          Subscribe
        </Button>
      </form>
    </div>
  );
}

export { NewsletterSignup };
