import { render } from '@testing-library/react';
import AccountLoading from '@/app/(auth)/account/loading';

describe('AccountLoading - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<AccountLoading />);
    expect(container).toMatchSnapshot();
  });

  it('should render all skeleton elements', () => {
    const { container } = render(<AccountLoading />);
    const skeletons = container.querySelectorAll(
      '.animate-pulse, [class*="Skeleton"]'
    );

    // Verify multiple skeleton elements are present
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
