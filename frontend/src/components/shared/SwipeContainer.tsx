'use client';

import { ReactNode } from 'react';
import { useSwipe } from '@/hooks/useSwipe';

interface SwipeContainerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  threshold?: number;
}

export function SwipeContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
  threshold,
}: SwipeContainerProps) {
  useSwipe(
    { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown },
    threshold
  );

  return (
    <div className={className}>
      {children}
    </div>
  );
}
