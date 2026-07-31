'use client';

import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'hsl(222 47% 7%)',
          border: '1px solid hsl(217 33% 17%)',
          color: 'hsl(210 40% 98%)',
          borderRadius: '0.75rem',
          backdropFilter: 'blur(12px)',
        },
      }}
    />
  );
}

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4 text-green-400" />,
    }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4 text-red-400" />,
    }),
  info: (message: string, description?: string) =>
    sonnerToast.info(message, {
      description,
      icon: <Info className="h-4 w-4 text-blue-400" />,
    }),
  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, {
      description,
      icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
    }),
};
