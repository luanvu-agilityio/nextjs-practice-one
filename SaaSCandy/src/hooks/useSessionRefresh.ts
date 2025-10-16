import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

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
