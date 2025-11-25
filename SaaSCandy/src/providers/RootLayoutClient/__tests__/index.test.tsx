import { render, screen } from '@testing-library/react';
import { RootLayoutClient, computeShouldShowHeader } from '..';
import { ROUTES } from '@/constants';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/components/layout', () => ({
  Header: () => {
    return <div data-testid='header'>Header</div>;
  },
  Footer: () => {
    return <div data-testid='footer'>Footer</div>;
  },
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('RootLayoutClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render header on non-home pages', () => {
    mockUsePathname.mockReturnValue('/about');

    render(
      <RootLayoutClient>
        <div>Content</div>
      </RootLayoutClient>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should not render header on home page', () => {
    mockUsePathname.mockReturnValue('/');

    render(
      <RootLayoutClient>
        <div>Content</div>
      </RootLayoutClient>
    );

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should not render header on page layout routes', () => {
    mockUsePathname.mockReturnValue('/portfolio');

    render(
      <RootLayoutClient>
        <div>Content</div>
      </RootLayoutClient>
    );

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('should render header for blog sub-pages (e.g. /blog/post-slug)', () => {
    mockUsePathname.mockReturnValue('/blog/my-post');

    render(
      <RootLayoutClient>
        <div>Content</div>
      </RootLayoutClient>
    );

    // blog sub-pages should show the header
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should not render header on the blog index page (/blog)', () => {
    mockUsePathname.mockReturnValue('/blog');

    render(
      <RootLayoutClient>
        <div>Content</div>
      </RootLayoutClient>
    );

    // the /blog index uses the page layout routes and should NOT show header
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should not render header for nested page-layout routes (e.g. /services/123)', () => {
    mockUsePathname.mockReturnValue('/services/123');

    render(
      <RootLayoutClient>
        <div>Content</div>
      </RootLayoutClient>
    );

    // when the pathname starts with a PAGE_LAYOUT route (and route !== '/blog'), header should be hidden
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render header when pathname is undefined', () => {
    // simulate no pathname (e.g., during certain tests/environments)
    mockUsePathname.mockReturnValue(undefined as unknown as string);

    render(
      <RootLayoutClient>
        <div>Content</div>
      </RootLayoutClient>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render header when pathname is an empty string', () => {
    mockUsePathname.mockReturnValue('');

    render(
      <RootLayoutClient>
        <div>Content</div>
      </RootLayoutClient>
    );

    // empty pathname should be treated as non-root and show header
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render header for /blog/ (trailing slash) as a blog sub-page', () => {
    mockUsePathname.mockReturnValue('/blog/');

    render(
      <RootLayoutClient>
        <div>Content</div>
      </RootLayoutClient>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should not render header for exact page-layout route /services', () => {
    mockUsePathname.mockReturnValue('/services');

    render(
      <RootLayoutClient>
        <div>Content</div>
      </RootLayoutClient>
    );

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('computeShouldShowHeader should match rendered behavior across many paths', () => {
    // a small battery of inputs to ensure computeShouldShowHeader exercises all branches
    expect(computeShouldShowHeader('/')).toBe(false);
    expect(computeShouldShowHeader('/about')).toBe(true);
    expect(computeShouldShowHeader('/portfolio')).toBe(false);
    expect(computeShouldShowHeader('/blog')).toBe(false);
    expect(computeShouldShowHeader('/blog/my-post')).toBe(true);
    expect(computeShouldShowHeader('/blog/')).toBe(true);
    expect(computeShouldShowHeader('/services')).toBe(false);
    expect(computeShouldShowHeader('/services/123')).toBe(false);
    expect(computeShouldShowHeader('')).toBe(true);
    expect(computeShouldShowHeader(undefined)).toBe(true);
  });

  it('computeShouldShowHeader exercises all page-layout routes (exact + subpath)', () => {
    const pageRoutes = [
      ROUTES.PORTFOLIO,
      ROUTES.PRICING,
      ROUTES.SERVICES,
      ROUTES.DOCS,
      ROUTES.BLOG,
      ROUTES.CONTACT,
    ];

    pageRoutes.forEach(route => {
      // exact route should hide header
      expect(computeShouldShowHeader(route)).toBe(false);

      // subpaths: blog subpaths should show header, others should hide
      const sub = `${route}/subpage`;
      if (route === ROUTES.BLOG) {
        expect(computeShouldShowHeader(sub)).toBe(true);
      } else {
        expect(computeShouldShowHeader(sub)).toBe(false);
      }
    });
  });

  it('computeShouldShowHeader accepts many path variants (no crash, returns boolean)', () => {
    const variants = [
      undefined,
      null,
      '',
      '/',
      '/about',
      '/blog',
      '/blog/',
      '/blog/abc',
      '/portfolio',
      '/portfolio/',
      '/portfolio/x',
      '/pricing',
      '/pricing/x',
      '/services',
      '/services/1',
      '/docs',
      '/docs/x',
      '/contact',
      '/contact/x',
    ] as Array<string | undefined | null>;

    variants.forEach(p => {
      const res = computeShouldShowHeader(p as unknown as string);
      expect(typeof res).toBe('boolean');
    });
  });
});
