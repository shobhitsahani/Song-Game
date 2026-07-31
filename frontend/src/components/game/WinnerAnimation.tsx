'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface WinnerAnimationProps {
  username: string;
  score: number;
}

export function WinnerAnimation({ username, score }: WinnerAnimationProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="relative"
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/40"
      >
        <Trophy className="w-14 h-14 text-white" />
      </motion.div>
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: [0, 1.5, 1], rotate: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute -top-2 -right-2"
      >
        <Sparkles className="w-8 h-8 text-yellow-400" />
      </motion.div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        className="absolute -bottom-1 -left-2"
      >
        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
      </motion.div>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            y: [-10, -40],
          }}
          transition={{
            duration: 1.5,
            delay: 0.8 + i * 0.2,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      ))}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mt-3 text-lg font-bold text-gradient"
      >
        {username}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground"
      >
        {score.toLocaleString()} points
      </motion.p>
    </motion.div>
  );
}
