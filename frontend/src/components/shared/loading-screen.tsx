'use client';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  text?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export function LoadingScreen({ text, message, size = 'md', fullScreen = true, className }: LoadingScreenProps) {
  const dotSize = size === 'sm' ? 'w-6 h-6 border-2' : size === 'lg' ? 'w-12 h-12 border-[3px]' : 'w-8 h-8 border-2';
  return (
    <div className={cn(fullScreen ? 'min-h-screen' : 'min-h-[200px]', 'flex items-center justify-center', className)} role="status" aria-label={text || message || 'Loading'}>
      <div className="text-center">
        <div className={cn('relative mx-auto mb-4', dotSize)}>
          <div className={cn('absolute inset-0 rounded-full border border-gold/25', dotSize)} />
          <div className={cn('absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin', dotSize)} />
        </div>
        <p className="text-muted-foreground">{text || message || 'Loading...'}</p>
      </div>
    </div>
  );
}
