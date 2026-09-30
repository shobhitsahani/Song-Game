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
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center"
        >
          {/* Pulsing aurora glow */}
          <motion.div
            className="absolute w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,hsl(262_84%_66%/0.22),transparent_65%)] blur-3xl pointer-events-none"
            animate={{ scale: countdown > 0 ? [0.9, 1.05, 0.9] : [1, 1.15, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />

          <motion.div
            key={countdown}
            initial={{ scale: 1.8, opacity: 0, rotateX: -40 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative text-center"
          >
            <div className="text-8xl md:text-9xl font-bold tracking-tight text-gradient mb-4 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-muted-foreground text-lg font-medium">
              {countdown > 0 ? 'Get ready…' : 'Guess the song!'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
