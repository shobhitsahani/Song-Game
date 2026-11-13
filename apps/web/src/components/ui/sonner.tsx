'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast liquid-glass-surface group-[.toaster]:bg-[var(--surface-1)]/90 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-[var(--foreground)] group-[.toaster]:border-[var(--glass-border)] group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl',
          description: 'group-[.toast]:text-[var(--muted-foreground)]',
          actionButton:
            'group-[.toast]:bg-[var(--primary)] group-[.toast]:text-[var(--primary-foreground)]',
          cancelButton:
            'group-[.toast]:bg-[var(--muted)] group-[.toast]:text-[var(--muted-foreground)]',
        },
      }}
      {...props}
    />
  );
};
