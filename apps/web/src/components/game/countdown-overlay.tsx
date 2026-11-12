'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CountdownOverlayProps {
  countdown: number;
  isActive: boolean;
}

export const CountdownOverlay = memo(function CountdownOverlay({
  countdown,
  isActive,
}: CountdownOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[var(--background)]/80 backdrop-blur-md flex items-center justify-center select-none"
        >
          <motion.div
            key={countdown}
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <div className="text-8xl sm:text-9xl font-black font-display text-[var(--primary)] mb-3 drop-shadow-2xl">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-[var(--muted-foreground)] text-lg sm:text-xl font-medium tracking-wide">
              {countdown > 0 ? 'Listen closely...' : 'Drop your answer!'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
