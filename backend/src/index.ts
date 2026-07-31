import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { config } from './config';
import { getRedis } from './redis';
import { getPrisma, connectDatabase, disconnectDatabase, healthCheck as dbHealthCheck } from './database';
import { redisHealthCheck } from './redis';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimiter';
import { setupSocketHandlers } from './socket';
import { RoomService } from './services/room.service';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import gameRoutes from './routes/games';
import friendRoutes from './routes/friends';
import notificationRoutes from './routes/notifications';
import playlistRoutes from './routes/playlists';
import leaderboardRoutes from './routes/leaderboards';
import leaderboardFriendsRoutes from './routes/leaderboard-routes';
import dailyRoutes from './routes/daily';
import achievementRoutes from './routes/achievements';

const app = express();
const httpServer = createServer(app);

const prisma = getPrisma();
const redis = getRedis();
const roomService = new RoomService(redis);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression({ level: 6, threshold: 256 }));
app.use(cookieParser(config.JWT_SECRET));
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.use(rateLimit({ windowMs: 60000, max: 100 }));

app.set('trust proxy', 1);

const io = new Server(httpServer, {
  cors: {
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  connectTimeout: 10000,
  maxHttpBufferSize: 1e6,
});

app.use('/api/auth', authRoutes(prisma, redis));
app.use('/api/users', userRoutes(prisma));
app.use('/api/games', gameRoutes(prisma));
app.use('/api/friends', friendRoutes(prisma));
app.use('/api/notifications', notificationRoutes(prisma));
app.use('/api/playlists', playlistRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/leaderboards', leaderboardFriendsRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/achievements', achievementRoutes);

app.get('/health', async (_req, res) => {
  const dbOk = await dbHealthCheck();
  const redisOk = await redisHealthCheck();
  const status = dbOk && redisOk ? 'ok' : 'degraded';
  res.setHeader('Cache-Control', 'no-cache');
  res.json({
    status,
    timestamp: new Date().toISOString(),
    checks: { database: dbOk, redis: redisOk },
    uptime: process.uptime(),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

setupSocketHandlers(io, prisma, redis, roomService);

async function start() {
  try {
    await connectDatabase();
    await redis.ping().catch(() => logger.warn('Redis unavailable, continuing without cache'));
    httpServer.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`, { env: config.NODE_ENV });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: String(error) });
    process.exit(1);
  }
}

start();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    Promise.all([disconnectDatabase(), redis.quit()]).catch(() => {});
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    Promise.all([disconnectDatabase(), redis.quit()]).catch(() => {});
    process.exit(0);
  });
});
