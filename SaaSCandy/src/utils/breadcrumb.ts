export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

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
