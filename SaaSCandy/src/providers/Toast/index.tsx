import { ReactNode } from 'react';
import { Toaster } from 'sonner';

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => (
  <>
    <Toaster
      position='top-right'
      closeButton={false}
      richColors={false}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'bg-transparent shadow-none border-none p-0',
        },
      }}
    />
    {children}
  </>
);
ToastProvider.displayName = 'ToastProvider';
export { ToastProvider };
