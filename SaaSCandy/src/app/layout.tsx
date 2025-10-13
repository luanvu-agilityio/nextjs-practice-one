'use client';

// import type { Metadata } from 'next';
import { usePathname } from 'next/navigation';

// Google Fonts
import { Manrope, Ubuntu } from 'next/font/google';

// CSS variables
import './globals.css';

// Providers
import {
  ReactQueryProvider,
  SessionProvider,
  ToastProvider,
} from '@/providers';

// Components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

// Pages that use PageLayout (don't need separate Header)
const PAGE_LAYOUT_ROUTES = [
  '/portfolio',
  '/pricing',
  '/services',
  '/docs',
  '/blog',
  '/contact',
];

// export const metadata: Metadata = {
//   generator: 'Next.js',
//   title: 'SaaSCandy',
//   description: 'Build Innovative Apps For Your Business',
//   keywords: ['SaaS', 'Candy', 'Business', 'Apps', 'Innovation'],
//   authors: [{ name: 'Luan Vu' }],
//   viewport: 'width=device-width, initial-scale=1',
//   robots: 'index, follow',
//   openGraph: {
//     title: 'SaaSCandy',
//     description: 'Build Innovative Apps For Your Business',
//     url: 'https://saascandy.com',
//     siteName: 'SaaSCandy',
//     images: [
//       {
//         url: 'https://saascandy.com/og-image.png',
//         width: 1200,
//         height: 630,
//         alt: 'SaaSCandy Logo',
//       },
//     ],
//     locale: 'en_US',
//     type: 'website',
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const shouldShowHeader =
    pathname !== '/' &&
    (!PAGE_LAYOUT_ROUTES.some(
      route =>
        pathname === route || (route !== '/blog' && pathname?.startsWith(route))
    ) ||
      (pathname?.startsWith('/blog/') && pathname !== '/blog'));

  return (
    <html lang='en' suppressHydrationWarning className='overflow-x-hidden'>
      <body className={`${ubuntu.variable} ${manrope.variable} antialiased `}>
        <ReactQueryProvider>
          <SessionProvider>
            <ToastProvider>
              {shouldShowHeader && <Header />}
              {children}
              <Footer />
            </ToastProvider>
          </SessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
