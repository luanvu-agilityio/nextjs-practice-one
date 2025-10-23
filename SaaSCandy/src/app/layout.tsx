import type { Metadata } from 'next';

// Google Fonts
import { Manrope, Ubuntu } from 'next/font/google';

// CSS variables
import './globals.css';

// Layout
import RootLayoutClient from '@/providers/RootLayoutClient';

// Client Component

const manrope = Manrope({
  variable: '--font-primary',
  subsets: ['latin'],
  display: 'swap',
});

const ubuntu = Ubuntu({
  variable: '--font-secondary',
  subsets: ['latin'],
  weight: ['300', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  generator: 'Next.js',
  title: 'SaaSCandy',
  description: 'Build Innovative Apps For Your Business',
  keywords: ['SaaS', 'Candy', 'Business', 'Apps', 'Innovation'],
  authors: [{ name: 'Luan Vu' }],
  viewport: 'width=device-width, initial-scale=1',
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

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning className='overflow-x-hidden'>
      <head>
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
}
export default RootLayout;
