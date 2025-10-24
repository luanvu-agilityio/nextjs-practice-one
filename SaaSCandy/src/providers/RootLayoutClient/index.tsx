'use client';

import { usePathname } from 'next/navigation';

// Providers
import { ReactQueryProvider, ToastProvider } from '@/providers';

// Components
import { Header, Footer } from '@/components/layout';

// Constants
import { ROUTES } from '@/constants';

// Pages that use PageLayout (don't need separate Header)
const PAGE_LAYOUT_ROUTES = [
  ROUTES.PORTFOLIO,
  ROUTES.PRICING,
  ROUTES.SERVICES,
  ROUTES.DOCS,
  ROUTES.BLOG,
  ROUTES.CONTACT,
];

const RootLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const shouldShowHeader =
    pathname !== '/' &&
    (!PAGE_LAYOUT_ROUTES.some(
      route =>
        pathname === route || (route !== '/blog' && pathname?.startsWith(route))
    ) ||
      (pathname?.startsWith('/blog/') && pathname !== '/blog'));

  return (
    <ReactQueryProvider>
      <ToastProvider>
        {shouldShowHeader && <Header />}
        {children}
        <Footer />
      </ToastProvider>
    </ReactQueryProvider>
  );
};
export { RootLayoutClient };
