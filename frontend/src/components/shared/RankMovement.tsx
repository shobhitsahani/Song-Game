'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankMovementProps {
  change: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RankMovement({ change, size = 'sm' }: RankMovementProps) {
  const sizeMap = { sm: 'h-3.5 w-3.5 text-xs', md: 'h-4 w-4 text-sm', lg: 'h-5 w-5 text-base' };
  const iconSize = { sm: 12, md: 14, lg: 16 };

  if (change === 0) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn('inline-flex items-center text-muted-foreground', sizeMap[size])}
      >
        <Minus size={iconSize[size]} />
      </motion.span>
    );
  }

  const isPositive = change > 0;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={change}
        initial={{ opacity: 0, y: isPositive ? 10 : -10, scale: 0.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: isPositive ? -10 : 10, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          'inline-flex items-center gap-0.5 font-medium',
          isPositive ? 'text-green-400' : 'text-red-400',
          sizeMap[size],
        )}
      >
        {isPositive ? (
          <ChevronUp size={iconSize[size]} />
        ) : (
          <ChevronDown size={iconSize[size]} />
        )}
        {Math.abs(change)}
      </motion.span>
    </AnimatePresence>
  );
}
