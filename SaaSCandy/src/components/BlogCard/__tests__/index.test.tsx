import { render } from '@testing-library/react';
import { BlogCard } from '../index';
import Image from 'next/image';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <Image src={''} alt={''} {...props} />
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
}));

describe('BlogCard', () => {
  const defaultProps = {
    slug: 'test-blog',
    title: 'Test Blog Title',
    date: '2024-01-01',
  };

  it('renders correctly with image', () => {
    const { container } = render(
      <BlogCard {...defaultProps} image='/test-image.jpg' />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders correctly without image', () => {
    const { container } = render(<BlogCard {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
