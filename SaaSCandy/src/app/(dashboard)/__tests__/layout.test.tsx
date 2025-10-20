import { render } from '@testing-library/react';
import DashboardLayout from '@/app/(dashboard)/layout';

describe('DashboardLayout - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should wrap children in a div', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
  });
});
