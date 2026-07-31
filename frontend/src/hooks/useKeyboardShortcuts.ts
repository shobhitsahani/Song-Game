'use client';
import { useEffect } from 'react';
export function useKeyboardShortcut(key: string | Record<string, () => void>, handler?: () => void, options?: { enabled?: boolean }) {
  useEffect(() => {
    if (typeof key === 'string' && handler) {
      const h = (e: KeyboardEvent) => { if (e.key.toLowerCase() === key.toLowerCase() && (!options || options.enabled !== false) && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); handler(); } };
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }
  }, [key, handler, options?.enabled]);
}