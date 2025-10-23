import { ROUTES } from '@/constants/auth-routes';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

/**
 * Generates an array of breadcrumb items from a given pathname.
 * Each segment of the path becomes a breadcrumb.
 *
 * @param pathname - The current URL pathname.
 * @returns Array of BreadcrumbItem objects for navigation.
 */
export const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    const isActive = index === segments.length - 1;

    breadcrumbs.push({ label, href: isActive ? undefined : href, isActive });
  });

  return breadcrumbs;
};

/**
 * Extracts and formats breadcrumbs from a pathname for UI display.
 * Customizes labels for common routes (e.g., 'signin' → 'Sign In').
 *
 * @param pathname - The current URL pathname.
 * @returns Array of formatted breadcrumb objects.
 */
export const extractBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = [{ label: 'Home', href: ROUTES.HOME, isActive: false }];

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    const isActive = index === segments.length - 1;

    breadcrumbs.push({
      label: label
        .replace('signin', 'Sign In')
        .replace('signup', 'Sign Up')
        .replace('account', 'Account'),
      href,
      isActive,
    });
  });

  return breadcrumbs;
};
