import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const useSessionRefresh = () => {
  const { data: session, update } = useSession();
  const router = useRouter();

  const refreshSession = async (
    newUserData?: Partial<Record<string, unknown>>
  ) => {
    if (!session) return;

    try {
      // Method 1: Update session with new data
      if (newUserData) {
        await update({
          ...session,
          user: {
            ...session.user,
            ...newUserData,
          },
        });
      }

      // Method 2: Force a complete session refresh
      await update();

      // Method 3: Refresh the page data
      router.refresh();

      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return false;
    }
  };

  return { refreshSession };
};
