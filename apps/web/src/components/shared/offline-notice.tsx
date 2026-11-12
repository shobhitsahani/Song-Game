'use client';

import { useState, useEffect } from 'react';
import { WifiSlash } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';

export function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    setIsOffline(!navigator.onLine);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-[var(--destructive)] text-[var(--destructive-foreground)] px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
          role="status"
          aria-live="polite"
        >
          <WifiSlash size={16} weight="bold" />
          <span>You are currently offline. Game server reconnecting...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
