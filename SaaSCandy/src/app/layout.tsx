import type { Metadata } from 'next';

import { Manrope, Ubuntu } from 'next/font/google';

// CSS variables
import './globals.css';

// Layout
import { RootLayoutClient } from '@/providers';

// Google Fonts with optimization
const manrope = Manrope({
  variable: '--font-primary',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const ubuntu = Ubuntu({
  variable: '--font-secondary',
  subsets: ['latin'],
  weight: ['300', '500'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  generator: 'Next.js',
  title: 'SaaSCandy',
  description: 'Build Innovative Apps For Your Business',
  keywords: ['SaaS', 'Candy', 'Business', 'Apps', 'Innovation'],
  authors: [{ name: 'Luan Vu' }],
  robots: 'index, follow',
  openGraph: {
    title: 'SaaSCandy',
    description: 'Build Innovative Apps For Your Business',
    url: 'nextjs-practice-one-luanvu.vercel.app',
    siteName: 'SaaSCandy',
    images: [
      {
        url: '/images/background/app.png',
        width: 1200,
        height: 630,
        alt: 'SaaSCandy Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang='en' suppressHydrationWarning className='overflow-x-hidden'>
      <head>
        {/* Preload critical image */}
        <link
          rel='preload'
          as='image'
          href='/images/background/homepage.png'
          fetchPriority='high'
        />
      </head>
      <body className={`${ubuntu.variable} ${manrope.variable} antialiased`}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
};

export default RootLayout;
