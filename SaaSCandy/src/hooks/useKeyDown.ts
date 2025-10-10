import { useEffect } from 'react';

interface UseKeyDownProps {
  keys: string[];
  handler: (key: string) => void;
  enabled?: boolean;
}

function useKeyDown({ keys, handler, enabled = true }: UseKeyDownProps) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (keys.includes(event.key)) {
        handler(event.key);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keys, handler, enabled]);
}
export { useKeyDown };
