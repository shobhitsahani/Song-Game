'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon, error, wrapperClassName, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-11 w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2 text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:border-violet-500/40 focus-visible:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50 transition-[border-color,box-shadow,background-color] duration-200',
              error
                ? 'border-rose-500/50 focus-visible:ring-rose-500/60'
                : 'border-white/[0.09]',
              icon && 'pl-10',
              className,
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-xs text-destructive"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
