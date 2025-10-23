/**
 * Utility function for merging Tailwind CSS class names conditionally.
 *
 * - Uses `clsx` for conditional class logic.
 * - Uses `tailwind-merge` to resolve Tailwind class conflicts.
 *
 * @param inputs - List of class values (strings, arrays, objects).
 * @returns A single merged class name string.

 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
