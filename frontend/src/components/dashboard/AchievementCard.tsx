'use client';

import { motion } from 'framer-motion';
import { Achievement } from '@/types';
import { Badge } from '@/components/ui/badge';

interface AchievementCardProps {
  achievement: Achievement;
  delay?: number;
}

export function AchievementCard({ achievement, delay = 0 }: AchievementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-lg p-3 md:p-4 glass-hover flex items-center gap-2 md:gap-3"
    >
      <span className="text-lg md:text-2xl shrink-0">{achievement.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs md:text-sm truncate">{achievement.title}</p>
        <p className="text-[10px] md:text-xs text-muted-foreground truncate">{achievement.description}</p>
      </div>
      <Badge variant="secondary" className="shrink-0 text-[9px] md:text-xs">
        {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : 'Locked'}
      </Badge>
    </motion.div>
  );
}
