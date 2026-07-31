import { getRedis } from '../redis';

const MATCHMAKING_QUEUE = 'matchmaking:queue';
const MATCHMAKING_TTL = 300;

interface MatchmakingRequest {
  userId: string;
  username: string;
  level: number;
  mode: string;
  category: string;
  joinedAt: number;
}

export async function joinMatchmakingQueue(request: MatchmakingRequest) {
  const redis = getRedis();
  const existing = await redis.sismember(MATCHMAKING_QUEUE, request.userId);
  if (existing) throw new Error('Already in queue');

  await redis.sadd(MATCHMAKING_QUEUE, request.userId);
  await redis.hset(`matchmaking:player:${request.userId}`, request as any);
  await redis.expire(`matchmaking:player:${request.userId}`, MATCHMAKING_TTL);

  const match = await findMatch(request);
  if (match) return { matched: true, players: match };

  return { matched: false, queueSize: await redis.scard(MATCHMAKING_QUEUE) };
}

export async function leaveMatchmakingQueue(userId: string) {
  const redis = getRedis();
  await redis.srem(MATCHMAKING_QUEUE, userId);
  await redis.del(`matchmaking:player:${userId}`);
}

export async function findMatch(request: MatchmakingRequest): Promise<string[] | null> {
  const redis = getRedis();
  const queue = await redis.smembers(MATCHMAKING_QUEUE);
  const candidates = queue.filter(id => id !== request.userId);

  for (const candidateId of candidates) {
    const candidate = await redis.hgetall(`matchmaking:player:${candidateId}`);
    if (!candidate) continue;

    if (
      (candidate as any).mode === request.mode &&
      (candidate as any).category === request.category &&
      Math.abs(parseInt((candidate as any).level) - request.level) <= 10
    ) {
      await redis.srem(MATCHMAKING_QUEUE, request.userId);
      await redis.srem(MATCHMAKING_QUEUE, candidateId);
      await redis.del(`matchmaking:player:${request.userId}`);
      await redis.del(`matchmaking:player:${candidateId}`);
      return [request.userId, candidateId];
    }
  }

  return null;
}

export async function getQueueSize(): Promise<number> {
  const redis = getRedis();
  return redis.scard(MATCHMAKING_QUEUE);
}

export async function getQueuePosition(userId: string): Promise<number> {
  const redis = getRedis();
  const queue = await redis.smembers(MATCHMAKING_QUEUE);
  return queue.indexOf(userId) + 1;
}
