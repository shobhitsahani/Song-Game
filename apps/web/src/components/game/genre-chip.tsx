'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GenreChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function GenreChip({ label, selected = false, onClick, className }: GenreChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-xs sm:text-sm px-3.5 py-2 rounded-2xl border transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        selected
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent font-semibold shadow-md shadow-[var(--glow)] scale-[1.02]'
          : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]',
        className
      )}
    >
      {label}
    </button>
  );
}
