'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({ title = 'Something went wrong', message = 'An unexpected error occurred.', onRetry, retryLabel = 'Try Again', className }: ErrorStateProps) {
  return (
    <motion.div className={cn('flex flex-col items-center justify-center py-16 px-4', className)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-4">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground text-center">{title}</h3>
      <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="md" onClick={onRetry} className="mt-6 gap-2">
          <RefreshCw className="h-4 w-4" />{retryLabel}
        </Button>
      )}
    </motion.div>
  );
}
