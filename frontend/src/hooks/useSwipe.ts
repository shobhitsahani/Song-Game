'use client';

import { useRef, useCallback, useEffect } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipe(handlers: SwipeHandlers, threshold = 50) {
  const startX = useRef(0);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < threshold) return;

    if (absDx > absDy) {
      if (dx > 0) handlers.onSwipeRight?.();
      else handlers.onSwipeLeft?.();
    } else {
      if (dy > 0) handlers.onSwipeDown?.();
      else handlers.onSwipeUp?.();
    }
  }, [handlers, threshold]);

  useEffect(() => {
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchEnd]);

  return null;
}
