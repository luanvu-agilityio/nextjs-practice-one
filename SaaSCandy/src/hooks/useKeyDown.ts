import { useEffect } from 'react';

interface UseKeyDownProps {
  keys: string[];
  handler: (key: string) => void;
  enabled?: boolean;
}

/**
 * Custom React hook that listens for specific keydown events and triggers a handler.
 *
 * Useful for keyboard shortcuts or accessibility features.
 *
 * @param keys - Array of key names to listen for (e.g., ['Escape', 'Enter']).
 * @param handler - Function to call when a specified key is pressed.
 * @param enabled - If false, disables the keydown listener (default: true).
 */
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
