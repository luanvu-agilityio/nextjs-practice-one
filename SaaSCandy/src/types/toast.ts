export const TOAST_VARIANTS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};
export type ToastVariant = (typeof TOAST_VARIANTS)[keyof typeof TOAST_VARIANTS];

export interface ToastProps {
  id?: string | number;
  title: string;
  description?: string;
  variant?: ToastVariant;
  icon?: React.ReactNode;
  hasCloseIcon?: boolean;
  duration?: number;
}
