'use client';
import Link from 'next/link';
// Components
import { Heading } from '@/components/common';

// Icons
import { Facebook, Linkedin, Twitter } from 'lucide-react';

interface ShareProps {
  url?: string;
  title?: string;
  className?: string;
}

function Share({ url = '', title = '', className = '' }: Readonly<ShareProps>) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : url;

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook width={14} height={14} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      className: 'bg-slate-blue hover:bg-teal-blue',
    },
    {
      name: 'Twitter',
      icon: <Twitter width={14} height={14} />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
      className: 'bg-sky-blue hover:bg-blue-foreground',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin width={14} height={14} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      className: 'bg-teal-blue hover:bg-slate-blue',
    },
  ];
  return (
    <div className={`space-y-3 ${className}`}>
      <Heading
        as='h3'
        className='font-semibold text-primary text-[35px]'
        content='Share'
      />
      {shareLinks.map(({ name, icon, url, className }) => (
        <Link
          key={name}
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className={`flex gap-2.5 items-center py-2 px-4 rounded-lg text-white text-md font-medium transition-colors ${className}`}
        >
          {icon}
          {name}
        </Link>
      ))}
    </div>
  );
}

export { Share };
