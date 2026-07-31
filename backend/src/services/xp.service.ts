import { getPrisma } from '../database';

export const XP_REWARDS = {
  WIN_GAME: 500,
  SECOND_PLACE: 300,
  THIRD_PLACE: 100,
  CORRECT_GUESS: 50,
  FAST_GUESS_BONUS: 100,
  PERFECT_GAME: 200,
  DAILY_LOGIN: 50,
  COMPLETE_CHALLENGE: 150,
} as const;

const XP_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
  5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000,
  21000, 23100, 25300, 27600, 30000, 32500, 35100, 37800, 40600, 43500,
  46500, 49600, 52800, 56100, 59500, 63000, 66600, 70300, 74100, 78000,
  82000, 86100, 90300, 94600, 99000, 103500, 108100, 112800, 117600, 122500,
];

export function getLevel(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getLevelProgress(xp: number) {
  const level = getLevel(xp);
  const currentThreshold = XP_THRESHOLDS[Math.max(0, level - 1)];
  const nextThreshold = XP_THRESHOLDS[Math.min(level, XP_THRESHOLDS.length - 1)];
  return {
    level,
    currentXP: xp - currentThreshold,
    nextLevelXP: nextThreshold - currentThreshold,
    progress: (xp - currentThreshold) / (nextThreshold - currentThreshold),
  };
}

export function getTitleForLevel(level: number): string {
  if (level >= 50) return 'Legend';
  if (level >= 40) return 'Maestro';
  if (level >= 30) return 'Virtuoso';
  if (level >= 20) return 'Expert';
  if (level >= 10) return 'Advanced';
  if (level >= 5) return 'Intermediate';
  return 'Beginner';
}

export function getBorderForLevel(level: number): string {
  if (level >= 50) return 'legend';
  if (level >= 30) return 'gold';
  if (level >= 20) return 'silver';
  if (level >= 10) return 'bronze';
  return 'default';
}

export async function awardXP(userId: string, amount: number, reason: string, metadata?: any): Promise<{ xp: number; level: number; leveledUp: boolean }> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true, level: true } });
  if (!user) throw new Error('User not found');

  const newXp = user.xp + amount;
  const newLevel = getLevel(newXp);
  const leveledUp = newLevel > user.level;

  await Promise.all([
    prisma.user.update({ where: { id: userId }, data: { xp: newXp, level: newLevel } }),
    prisma.xPTransaction.create({
      data: { userId, amount, reason: reason || 'Activity', metadata: metadata || {} },
    }),
  ]);

  return { xp: newXp, level: newLevel, leveledUp };
}
