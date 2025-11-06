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

export const computeShouldShowHeader = (pathname?: string | null) => {
  const isRoot = pathname === '/';

  const isBlogSub = Boolean(
    pathname?.startsWith('/blog/') && pathname !== '/blog'
  );

  const isPageLayout = PAGE_LAYOUT_ROUTES.some(route => {
    if (pathname === route) return true;
    if (route !== ROUTES.BLOG && pathname?.startsWith(route)) return true;
    return false;
  });

  return !isRoot && (!isPageLayout || isBlogSub);
};

const RootLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const shouldShowHeader = computeShouldShowHeader(pathname);

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
