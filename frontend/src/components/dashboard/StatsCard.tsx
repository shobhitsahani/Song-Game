'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}

export function StatsCard({ icon, label, value, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="glass rounded-xl p-3 md:p-5 glass-hover"
    >
      <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
        <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
          {icon}
        </div>
        <span className="text-[10px] md:text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg md:text-3xl font-bold">{value}</p>
    </motion.div>
  );
}
