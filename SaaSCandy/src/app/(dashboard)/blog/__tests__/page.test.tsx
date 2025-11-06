import { render } from '@testing-library/react';
import BlogPage, * as BlogModule from '@/app/(dashboard)/blog/page';

jest.mock('@/components/layout/PageLayout', () => ({
  PageLayout: ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) => {
    return (
      <div data-testid='page-layout'>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    );
  },
}));

jest.mock('@/components/pages', () => ({
  BlogPageContent: () => {
    return <div data-testid='blog-page'>Blog Page Content</div>;
  },
}));

describe('Blog Page - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<BlogPage />);
    expect(container).toMatchSnapshot();
  });

  it('should render with correct title and subtitle', () => {
    const { getByText } = render(<BlogPage />);

    expect(getByText('Blog')).toBeInTheDocument();
    expect(
      getByText(/Discover a wealth of insightful materials/)
    ).toBeInTheDocument();
  });

  it('should render BlogPage component', () => {
    const { getByTestId } = render(<BlogPage />);

    expect(getByTestId('blog-page')).toBeInTheDocument();
  });

  it('exports metadata', () => {
    // ensure module-level metadata is executed and counted by coverage
    expect(BlogModule.metadata).toBeDefined();
  });
});
