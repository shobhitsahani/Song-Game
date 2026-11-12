import React from 'react';
import { cn } from '@/lib/utils';
import { GlassSurface } from '@/components/glass/glass-surface';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <GlassSurface variant="regular" radius="xl" className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center mb-4 text-[var(--primary)]">
        <Icon size={28} weight="duotone" />
      </div>
      <h3 className="text-lg font-bold font-display text-[var(--foreground)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--muted-foreground)] max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </GlassSurface>
  );
}
