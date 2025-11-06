import { render, screen } from '@testing-library/react';
import { RootLayoutClient } from '..';
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
});
