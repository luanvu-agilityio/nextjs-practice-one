import { render, screen } from '@testing-library/react';

// ReactQueryProvider Tests
import { ReactQueryProvider } from '@/providers/QueryClient/index';

jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn().mockImplementation(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='query-provider'>{children}</div>
  ),
}));

describe('ReactQueryProvider', () => {
  it('should render children wrapped in QueryClientProvider', () => {
    render(
      <ReactQueryProvider>
        <div>Test Content</div>
      </ReactQueryProvider>
    );

    expect(screen.getByTestId('query-provider')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
