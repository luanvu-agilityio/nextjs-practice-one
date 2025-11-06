import { render } from '@testing-library/react';
import AccountPage, * as AccountModule from '@/app/(auth)/account/page';

// Mock the component
jest.mock('@/components/pages', () => ({
  AccountPageContent: () => (
    <div data-testid='account-page-content'>Account Page Content</div>
  ),
}));

describe('AccountPage - Snapshot Tests', () => {
  it('should match snapshot', () => {
    const { container } = render(<AccountPage />);
    expect(container).toMatchSnapshot();
  });

  it('should render AccountPageContent component', () => {
    const { getByTestId } = render(<AccountPage />);
    expect(getByTestId('account-page-content')).toBeInTheDocument();
  });

  it('should export metadata', () => {
    expect(AccountModule.metadata).toBeDefined();
  });
});
