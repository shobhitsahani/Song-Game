'use client';

import { useEffect, useRef, useState } from 'react';

export function useKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const initialViewport = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const vh = window.innerHeight;
      if (!initialViewport.current) {
        initialViewport.current = vh;
      }
      const diff = initialViewport.current - vh;
      setIsKeyboardOpen(diff > 100);
    };

    const vv = (window as any).visualViewport;
    if (vv) {
      initialViewport.current = vv.height;
      vv.addEventListener('resize', handleResize);
      return () => vv.removeEventListener('resize', handleResize);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isKeyboardOpen;
}
