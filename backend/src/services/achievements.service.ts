import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../database';
import { sendNotification } from './notifications.service';
import { awardXP } from './xp.service';

const prisma: PrismaClient = (() => { try { return getPrisma(); } catch { return new PrismaClient(); } })();

interface AchievementDef {
  type: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
}

const ACHIEVEMENTS: Record<string, AchievementDef> = {
  FIRST_WIN: { type: 'FIRST_WIN', title: 'First Victory', description: 'Win your first game', icon: '🏆', rarity: 'common', xpReward: 100 },
  WIN_STREAK_3: { type: 'WIN_STREAK_3', title: 'Hat Trick', description: 'Win 3 games in a row', icon: '🎯', rarity: 'common', xpReward: 200 },
  WIN_STREAK_5: { type: 'WIN_STREAK_5', title: 'On Fire', description: 'Win 5 games in a row', icon: '🔥', rarity: 'uncommon', xpReward: 500 },
  WIN_STREAK_10: { type: 'WIN_STREAK_10', title: 'Unstoppable', description: 'Win 10 games in a row', icon: '💪', rarity: 'rare', xpReward: 1000 },
  PERFECT_GAME: { type: 'PERFECT_GAME', title: 'Perfect Score', description: 'Get a perfect score in a game', icon: '🌟', rarity: 'rare', xpReward: 500 },
  SPEED_DEMON: { type: 'SPEED_DEMON', title: 'Speed Demon', description: 'Answer correctly in under 2 seconds', icon: '⚡', rarity: 'uncommon', xpReward: 300 },
  CENTURY_CLUB: { type: 'CENTURY_CLUB', title: 'Century Club', description: 'Win 100 games', icon: '💎', rarity: 'epic', xpReward: 2000 },
  SOCIAL_BUTTERFLY: { type: 'SOCIAL_BUTTERFLY', title: 'Social Butterfly', description: 'Play with 50 different players', icon: '🦋', rarity: 'rare', xpReward: 1000 },
  PLAY_100: { type: 'PLAY_100', title: 'Dedicated', description: 'Play 100 games', icon: '🎮', rarity: 'uncommon', xpReward: 500 },
  PLAY_500: { type: 'PLAY_500', title: 'Veteran', description: 'Play 500 games', icon: '🎖️', rarity: 'epic', xpReward: 2000 },
  CORRECT_100: { type: 'CORRECT_100', title: 'Century of Correct Answers', description: 'Get 100 correct answers total', icon: '✅', rarity: 'uncommon', xpReward: 400 },
  FAST_FINGERS: { type: 'FAST_FINGERS', title: 'Fast Fingers', description: 'Average response time under 3 seconds across 10 games', icon: '⌨️', rarity: 'rare', xpReward: 800 },
  MUSIC_EXPERT: { type: 'MUSIC_EXPERT', title: 'Music Expert', description: 'Correctly identify songs from 5 different genres', icon: '🎵', rarity: 'rare', xpReward: 1000 },
  GENRE_MASTER: { type: 'GENRE_MASTER', title: 'Genre Master', description: 'Get 100 correct answers in a single genre', icon: '🎼', rarity: 'epic', xpReward: 1500 },
  LEVEL_10: { type: 'LEVEL_10', title: 'Double Digits', description: 'Reach level 10', icon: '🔟', rarity: 'common', xpReward: 200 },
  LEVEL_25: { type: 'LEVEL_25', title: 'Quarter Century', description: 'Reach level 25', icon: '💫', rarity: 'uncommon', xpReward: 500 },
  LEVEL_50: { type: 'LEVEL_50', title: 'Half Century', description: 'Reach level 50', icon: '👑', rarity: 'legendary', xpReward: 5000 },
  WIN_10: { type: 'WIN_10', title: 'Double Digit Wins', description: 'Win 10 games', icon: '🏅', rarity: 'common', xpReward: 300 },
  SURVIVOR: { type: 'SURVIVOR', title: 'Survivor', description: 'Win a Survival mode game', icon: '🛡️', rarity: 'uncommon', xpReward: 400 },
  PARTY_ANIMAL: { type: 'PARTY_ANIMAL', title: 'Party Animal', description: 'Play a Party mode game with 8+ players', icon: '🎉', rarity: 'uncommon', xpReward: 300 },
  HARDCORE_CLEAR: { type: 'HARDCORE_CLEAR', title: 'Hardcore Clear', description: 'Win a Hardcore mode game', icon: '☠️', rarity: 'epic', xpReward: 1000 },
  DAILY_PLAYER: { type: 'DAILY_PLAYER', title: 'Daily Player', description: 'Complete 7 daily challenges', icon: '📅', rarity: 'uncommon', xpReward: 500 },
  STREAK_7: { type: 'STREAK_7', title: 'Week Warrior', description: 'Maintain a 7-day daily streak', icon: '📆', rarity: 'rare', xpReward: 1000 },
  FRIENDLY: { type: 'FRIENDLY', title: 'Friendly', description: 'Add 10 friends', icon: '🤝', rarity: 'common', xpReward: 200 },
  LEGEND: { type: 'LEGEND', title: 'Legend', description: 'Reach level 50 and win 100 games', icon: '🏰', rarity: 'legendary', xpReward: 10000 },
};

export async function checkAndAwardAchievement(userId: string, type: string): Promise<boolean> {
  const def = ACHIEVEMENTS[type];
  if (!def) return false;

  const existing = await prisma.achievement.findUnique({
    where: { userId_type: { userId, type } },
  });
  if (existing) return false;

  await prisma.achievement.create({
    data: {
      userId,
      type: def.type,
      title: def.title,
      description: def.description,
      icon: def.icon,
      rarity: def.rarity,
      xpReward: def.xpReward,
    },
  });

  await awardXP(userId, def.xpReward, `Achievement: ${def.title}`);

  await sendNotification(prisma, userId, 'ACHIEVEMENT_UNLOCK', 'Achievement Unlocked!', `"${def.title}" - ${def.description}`, { type, xpReward: def.xpReward });

  return true;
}

export async function getUserAchievements(userId: string) {
  return prisma.achievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
  });
}

export async function getAllAchievements() {
  return Object.values(ACHIEVEMENTS);
}

export async function getAchievementProgress(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const earned = new Set((await prisma.achievement.findMany({ where: { userId } })).map(a => a.type));

  return Object.values(ACHIEVEMENTS).map(def => ({
    ...def,
    unlocked: earned.has(def.type),
  }));
}
