import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../database';
import { getRedis } from '../redis';
import { awardXP, XP_REWARDS } from './xp.service';
import { checkAndAwardAchievement } from './achievements.service';

const prisma: PrismaClient = (() => { try { return getPrisma(); } catch { return new PrismaClient(); } })();

export async function getDailyChallenge(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cacheKey = `daily:challenge:${userId}:${today.toISOString().slice(0, 10)}`;
  const cached = await getRedis().get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  let challenge = await prisma.dailyChallenge.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (!challenge) {
    challenge = await prisma.dailyChallenge.create({
      data: {
        userId,
        date: today,
        playlistId: getDailyPlaylist(),
      },
    });
  }

  await getRedis().setex(cacheKey, 300, JSON.stringify(challenge)).catch(() => {});
  return challenge;
}

export async function submitDailyScore(userId: string, score: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenge = await prisma.dailyChallenge.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (!challenge) throw new Error('No daily challenge for today');
  if (challenge.completed) throw new Error('Daily challenge already completed');

  const updated = await prisma.dailyChallenge.update({
    where: { id: challenge.id },
    data: { score, completed: true },
  });

  await awardXP(userId, XP_REWARDS.COMPLETE_CHALLENGE, 'Daily Challenge Completed', { score });

  const streak = await getDailyStreak(userId);
  if (streak >= 7) {
    await checkAndAwardAchievement(userId, 'STREAK_7');
  }

  const cacheKey = `daily:challenge:${userId}:${today.toISOString().slice(0, 10)}`;
  await getRedis().del(cacheKey).catch(() => {});

  return updated;
}

export async function claimDailyReward(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenge = await prisma.dailyChallenge.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (!challenge || !challenge.completed || challenge.rewardClaimed) {
    throw new Error('Cannot claim reward');
  }

  await awardXP(userId, XP_REWARDS.COMPLETE_CHALLENGE, 'Daily Challenge Reward Claimed');
  await checkAndAwardAchievement(userId, 'DAILY_PLAYER');

  return prisma.dailyChallenge.update({
    where: { id: challenge.id },
    data: { rewardClaimed: true },
  });
}

export async function getDailyStreak(userId: string): Promise<number> {
  const cacheKey = `daily:streak:${userId}`;
  const cached = await getRedis().get(cacheKey).catch(() => null);
  if (cached) return parseInt(cached);

  const challenges = await prisma.dailyChallenge.findMany({
    where: { userId, completed: true },
    orderBy: { date: 'desc' },
    take: 30,
    select: { date: true },
  });

  if (challenges.length === 0) return 0;

  let streak = 1;
  for (let i = 1; i < challenges.length; i++) {
    const diff = Math.abs(challenges[i - 1].date.getTime() - challenges[i].date.getTime());
    if (diff === 86400000) {
      streak++;
    } else {
      break;
    }
  }

  await getRedis().setex(cacheKey, 300, streak.toString()).catch(() => {});
  return streak;
}

export async function getDailyLeaderboard(date?: Date) {
  const targetDate = date || new Date();
  targetDate.setHours(0, 0, 0, 0);

  const cacheKey = `daily:leaderboard:${targetDate.toISOString().slice(0, 10)}`;
  const cached = await getRedis().get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const result = await prisma.dailyChallenge.findMany({
    where: { date: targetDate, completed: true },
    orderBy: { score: 'desc' },
    take: 100,
    select: {
      score: true,
      user: { select: { id: true, username: true, avatar: true, level: true } },
    },
  });

  await getRedis().setex(cacheKey, 60, JSON.stringify(result)).catch(() => {});
  return result;
}

function getDailyPlaylist(): string {
  const playlists = [
    '37i9dQZF1DXcBWIGoYBM5M',
    '37i9dQZF1DX0kbJZpiYdZl',
    '37i9dQZF1DX0XUfTFmNBRM',
    '37i9dQZF1DXbITWG1ZJKYt',
    '37i9dQZF1EIduFnvvkNHtW',
  ];
  const dayIndex = new Date().getDate();
  return playlists[dayIndex % playlists.length];
}
