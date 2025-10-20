import { render } from '@testing-library/react';
import BlogListLoading from '@/app/(dashboard)/blog/loading';

describe('BlogListLoading - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<BlogListLoading />);
    expect(container).toMatchSnapshot();
  });

  it('should render all skeleton elements', () => {
    const { container } = render(<BlogListLoading />);
    const skeletons = container.querySelectorAll(
      '.animate-pulse, [class*="Skeleton"]'
    );

    // Verify multiple skeleton elements are present
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
