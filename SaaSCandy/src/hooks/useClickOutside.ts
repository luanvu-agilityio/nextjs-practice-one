import { useEffect, RefObject } from 'react';
interface UseOutsideClickProps {
  ref: RefObject<HTMLElement | null>;
  handler: () => void;
  enabled?: boolean;
}

/**
 * Custom React hook that triggers a handler when a click or touch event occurs outside the referenced element.
 * Useful for closing dropdowns, modals, or popovers when clicking outside.
 *
 * @param ref - Ref object pointing to the target element.
 * @param handler - Function to call when an outside click is detected.
 * @param enabled - If false, disables the outside click detection (default: true).
 */
function useOutsideClick({
  ref,
  handler,
  enabled = true,
}: UseOutsideClickProps) {
  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler, enabled]);
}

export { useOutsideClick };
