import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom React hook to refresh the user's session.
 *
 * This hook provides a `refreshSession` function that:
 * - Invalidates the React Query cache for the 'session' query, triggering a refetch.
 * - Refreshes the Next.js router cache to update session-dependent UI.
 *
 * @returns An object with the `refreshSession` async function.
 */
export const useSessionRefresh = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const refreshSession = async () => {
    try {
      // Method 1: Invalidate React Query cache (refetch session)
      await queryClient.invalidateQueries({
        queryKey: ['session'],
      });

      // Method 2: Refresh Next.js router cache
      router.refresh();

      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return false;
    }
  };

  return { refreshSession };
};
