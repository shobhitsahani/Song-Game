'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getLevelProgress, formatXp } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface XpBarProps {
  xp: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function XpBar({ xp, showLabel = true, size = 'md', className }: XpBarProps) {
  const [prevLevel, setPrevLevel] = React.useState(0);
  const [showLevelUp, setShowLevelUp] = React.useState(false);
  const { level, currentXp, nextLevelXp, progress } = getLevelProgress(xp);

  React.useEffect(() => {
    if (prevLevel > 0 && level > prevLevel) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 2000);
      return () => clearTimeout(timer);
    }
    setPrevLevel(level);
  }, [level, prevLevel]);

  const barHeight = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={cn('relative', className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Zap className="h-3 w-3 text-yellow-400" />
            Level {level}
          </span>
          <span className="text-muted-foreground">
            {formatXp(currentXp)} / {formatXp(nextLevelXp)} XP
          </span>
        </div>
      )}
      <Progress value={progress * 100} color="default" barClassName={barHeight} />
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-gradient text-lg font-bold">Level Up!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
