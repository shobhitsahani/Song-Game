'use client';

import { useState, useCallback, useEffect } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const enter = useCallback(async (element?: HTMLElement) => {
    try {
      const el = element || document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      }
    } catch {}
  }, []);

  const exit = useCallback(async () => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {}
  }, []);

  const toggle = useCallback(async (element?: HTMLElement) => {
    if (isFullscreen) {
      await exit();
    } else {
      await enter(element);
    }
  }, [isFullscreen, enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
