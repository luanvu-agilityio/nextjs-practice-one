import { render } from '@testing-library/react';
import * as BlogCardModule from '../index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <img {...props} alt='Next Image' />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock('@/components/common', () => ({
  Heading: ({
    content,
    ...props
  }: { content: React.ReactNode } & Record<string, unknown>) => (
    <h3 {...props}>{content}</h3>
  ),
  Skeleton: (props: Record<string, unknown>) => <div {...props} />,
}));

describe('BlogCard', () => {
  const defaultProps = {
    slug: 'test-blog',
    title: 'Test Blog Title',
    date: '2024-01-01',
  };

  it('renders correctly with image', () => {
    const { container } = render(
      <BlogCardModule.BlogCard {...defaultProps} image='/test-image.jpg' />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders correctly without image', () => {
    const { container } = render(<BlogCardModule.BlogCard {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('exports BlogCardSkeleton', () => {
    // Render the skeleton component so its function body is executed and counted by coverage
    const { container } = render(<BlogCardModule.BlogCardSkeleton />);
    expect(container).toMatchSnapshot();
  });
});
