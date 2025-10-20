import { render } from '@testing-library/react';
import AuthSectionSkeleton from '@/components/layout/Header/AuthSectionSkeleton';

describe('AuthSectionSkeleton - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<AuthSectionSkeleton />);
    expect(container).toMatchSnapshot();
  });

  it('should render skeleton elements', () => {
    const { container } = render(<AuthSectionSkeleton />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(2);
  });

  it('should have correct skeleton styling', () => {
    const { container } = render(<AuthSectionSkeleton />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('bg-gray-200', 'rounded');
    });
  });
});
