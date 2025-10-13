import type { ComponentType } from 'react';

import TwitterIcon from '@/components/icons/TwitterIcon';
import FacebookIcon from '@/components/icons/FacebookIcon';
import GooglePlusIcon from '@/components/icons/GooglePlusIcon';
import LinkedInIcon from '@/components/icons/LinkedInIcon';
import { ROUTES } from './auth-routes';

export const NAV_LINKS = [
  { href: ROUTES.PORTFOLIO, label: 'Portfolio' },
  { href: ROUTES.PRICING, label: 'Pricing' },
  { href: ROUTES.SERVICES, label: 'Services' },
  { href: ROUTES.BLOG, label: 'Blog' },
  { href: ROUTES.CONTACT, label: 'Contact' },
  { href: ROUTES.DOCS, label: 'Docs' },
];

type SocialLink = {
  href: string;
  label: string;
  icon: ComponentType;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { href: 'https://facebook.com', label: 'facebook', icon: FacebookIcon },
  { href: 'https://twitter.com', label: 'twitter', icon: TwitterIcon },
  { href: 'https://plus.google.com', label: 'google', icon: GooglePlusIcon },
  { href: 'https://linkedin.com', label: 'linkedin', icon: LinkedInIcon },
];
