'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  countdown: number;
  isActive: boolean;
}

export const CountdownOverlay = memo(function CountdownOverlay({ countdown, isActive }: CountdownOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="text-8xl font-bold text-gradient mb-4">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-muted-foreground text-lg">
              {countdown > 0 ? 'Get Ready...' : 'Guess the song!'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
