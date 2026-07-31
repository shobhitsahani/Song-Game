/*
 * Auth service commented out — requires PostgreSQL + JWT + Redis.
 * Only `toSafeUser` is kept exported (pure utility, no dependencies).
 *
 * Restore when backend infrastructure is set up:
 *   - Uncomment imports (jwt, uuid, env, prisma, redis, types)
 *   - Uncomment all functions below
 */

import type { SafeUser } from '@song-game/types';

export function toSafeUser(user: {
  id: string; email: string | null; username: string; displayName: string | null;
  avatar: string | null; googleId: string | null; isGuest: boolean;
  xp: number; level: number; wins: number; totalGames: number;
  createdAt: Date; updatedAt: Date;
}): SafeUser {
  return {
    id: user.id, email: user.email, username: user.username,
    displayName: user.displayName, avatar: user.avatar, isGuest: user.isGuest,
    xp: user.xp, level: user.level, wins: user.wins, totalGames: user.totalGames,
    createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
  };
}

/*
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { getRedis } from '../config/redis.js';
import type { AuthTokens, JWTPayload, LoginResponse } from '@song-game/types';

function generateAccessToken(userId: string): string {
  return jwt.sign({ userId, type: 'access' } as JWTPayload, env.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' } as JWTPayload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
}

export async function generateTokens(userId: string): Promise<AuthTokens> {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  await storeRefreshToken(userId, refreshToken);
  return { accessToken, refreshToken, expiresIn: 900 };
}

export async function refreshTokens(refreshTokenStr: string): Promise<LoginResponse> {
  const payload = jwt.verify(refreshTokenStr, env.JWT_REFRESH_SECRET) as JWTPayload;
  if (payload.type !== 'refresh') throw new Error('Invalid refresh token');
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshTokenStr } });
  if (!stored || stored.expiresAt < new Date()) throw new Error('Refresh token expired or revoked');
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new Error('User not found');
  const tokens = await generateTokens(user.id);
  return { user: toSafeUser(user), tokens };
}

export async function findOrCreateGoogleUser(profile: { id: string; email: string; displayName: string; avatar: string | null }): Promise<LoginResponse> {
  let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
  if (user) {
    user = await prisma.user.update({ where: { id: user.id }, data: { avatar: profile.avatar, displayName: profile.displayName } });
  } else {
    const baseUsername = profile.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
    let username = baseUsername; let counter = 1;
    while (await prisma.user.findUnique({ where: { username } })) { username = `${baseUsername}_${counter}`; counter++; }
    user = await prisma.user.create({ data: { googleId: profile.id, email: profile.email, username, displayName: profile.displayName, avatar: profile.avatar, isGuest: false } });
  }
  const tokens = await generateTokens(user.id);
  return { user: toSafeUser(user), tokens };
}

export async function createGuestUser(): Promise<LoginResponse> {
  const guestId = uuidv4().slice(0, 8);
  const username = `Guest_${guestId}`;
  const user = await prisma.user.create({ data: { username, displayName: `Guest ${guestId}`, isGuest: true } });
  const tokens = await generateTokens(user.id);
  return { user: toSafeUser(user), tokens };
}

export async function logout(refreshTokenStr: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token: refreshTokenStr } });
  const redis = getRedis();
}

export async function getMe(userId: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? toSafeUser(user) : null;
}
*/
