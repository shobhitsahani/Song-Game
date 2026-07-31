'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface XpAnimationProps {
  xpGained: number;
  levelUp?: boolean;
  newLevel?: number;
  onComplete?: () => void;
}

export function XpAnimation({ xpGained, levelUp, newLevel, onComplete }: XpAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -30, -60] }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-12 h-12 text-yellow-400 mb-2" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="text-3xl font-bold text-yellow-400 drop-shadow-lg"
            >
              +{xpGained} XP
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mt-2"
            />
            {levelUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="mt-3 text-center"
              >
                <p className="text-lg font-bold text-green-400">Level Up!</p>
                <p className="text-sm text-green-300">You reached level {newLevel}</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
