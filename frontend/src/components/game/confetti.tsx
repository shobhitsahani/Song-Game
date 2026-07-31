'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPieceProps {
  index: number;
}

const COLORS = [
  '#a855f7',
  '#ec4899',
  '#eab308',
  '#ffffff',
  '#8b5cf6',
  '#22c55e',
  '#3b82f6',
  '#f97316',
  '#06b6d4',
  '#d946ef',
];

const SHAPES = ['circle', 'square', 'strip', 'star'] as const;

function ConfettiPiece({ index }: ConfettiPieceProps) {
  const color = COLORS[index % COLORS.length];
  const shape = SHAPES[index % SHAPES.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 2.5 + Math.random() * 3;
  const size = 6 + Math.random() * 10;
  const rotation = Math.random() * 720;

  const shapeStyle = useMemo(() => {
    switch (shape) {
      case 'circle':
        return { borderRadius: '50%', width: size, height: size };
      case 'square':
        return { borderRadius: '2px', width: size, height: size };
      case 'strip':
        return { borderRadius: '1px', width: size * 1.5, height: size * 0.4 };
      case 'star':
        return { borderRadius: '50%', width: size, height: size, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' };
    }
  }, [shape, size]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${left}%`,
        top: -20,
        ...shapeStyle,
        backgroundColor: color,
      }}
      initial={{
        y: -20,
        x: 0,
        rotate: 0,
        opacity: 1,
        scale: 1,
      }}
      animate={{
        y: typeof window !== 'undefined' ? window.innerHeight + 100 : 900,
        x: [-20, 30, -10, 20, -5],
        rotate: [0, rotation, -rotation * 0.5, rotation * 0.8, rotation],
        opacity: [1, 1, 1, 1, 0],
        scale: [1, 1.2, 0.8, 1.1, 0.5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.2, 0.4, 0.7, 1],
      }}
    />
  );
}

export function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }).map((_, i) => i), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </div>
  );
}
