'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, className }: EmptyStateProps) {
  return (
    <motion.div className={cn('flex flex-col items-center justify-center py-16 px-4', className)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </motion.div>
      <h3 className="text-lg font-semibold text-foreground text-center">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">{description}</p>}
    </motion.div>
  );
}
