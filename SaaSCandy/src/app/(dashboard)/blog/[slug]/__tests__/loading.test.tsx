import { render } from '@testing-library/react';
import BlogDetailLoading from '@/app/(dashboard)/blog/[slug]/loading';

describe('BlogDetailLoading - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<BlogDetailLoading />);
    expect(container).toMatchSnapshot();
  });

  it('should render all skeleton elements', () => {
    const { container } = render(<BlogDetailLoading />);
    const skeletons = container.querySelectorAll(
      '.animate-pulse, [class*="Skeleton"]'
    );

    // Verify multiple skeleton elements are present
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
