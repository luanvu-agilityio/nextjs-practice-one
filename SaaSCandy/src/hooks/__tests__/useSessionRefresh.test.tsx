import { renderHook, act } from '@testing-library/react';
import { useSessionRefresh } from '@/hooks/useSessionRefresh';

// Create more focused mocks
const mockRefresh = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

describe('useSessionRefresh Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should refresh session successfully', async () => {
    mockInvalidateQueries.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSessionRefresh());

    let success: boolean;
    await act(async () => {
      success = await result.current.refreshSession();
    });

    expect(success!).toBe(true);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['session'],
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should handle refresh errors gracefully', async () => {
    mockInvalidateQueries.mockRejectedValue(new Error('Refresh failed'));

    const { result } = renderHook(() => useSessionRefresh());

    let success: boolean;
    await act(async () => {
      success = await result.current.refreshSession();
    });

    expect(success!).toBe(false);
  });
});
