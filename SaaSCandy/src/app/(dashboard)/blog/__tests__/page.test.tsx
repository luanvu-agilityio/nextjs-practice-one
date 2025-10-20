import { render } from '@testing-library/react';
import Blog from '@/app/(dashboard)/blog/page';

jest.mock('@/components/layout/PageLayout', () => {
  return function PageLayout({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) {
    return (
      <div data-testid='page-layout'>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/BlogPage', () => {
  return function BlogPage() {
    return <div data-testid='blog-page'>Blog Page Content</div>;
  };
});

describe('Blog Page - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<Blog />);
    expect(container).toMatchSnapshot();
  });

  it('should render with correct title and subtitle', () => {
    const { getByText } = render(<Blog />);

    expect(getByText('Blog')).toBeInTheDocument();
    expect(
      getByText(/Discover a wealth of insightful materials/)
    ).toBeInTheDocument();
  });

  it('should render BlogPage component', () => {
    const { getByTestId } = render(<Blog />);

    expect(getByTestId('blog-page')).toBeInTheDocument();
  });
});
