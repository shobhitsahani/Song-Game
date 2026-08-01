import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase, prisma } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { errorHandler } from './middleware/error.js';
import { setupSocketHandlers } from './socket/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import friendRoutes from './routes/friends.js';
import notificationRoutes from './routes/notifications.js';
import healthRoutes from './routes/health.js';
import leaderboardRoutes from './routes/leaderboard.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ['websocket', 'polling'],
});

// ─── Middleware ──────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression({ level: 6, threshold: 256 }));
app.use(cookieParser());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// ─── Routes ──────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'Song-Game API',
    status: 'ok',
    socket: '/socket.io/',
    health: '/api/health',
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// ─── Error Handler ───────────────────────────────────
app.use(errorHandler);

// ─── Socket.IO ──────────────────────────────────────
setupSocketHandlers(io);

// ─── Start ──────────────────────────────────────────
async function start() {
  try {
    /* COMMENTED: DB/Redis connection skipped — auth disabled
     * await connectDatabase();
     * await connectRedis();
     */
    await connectDatabase();

    httpServer.listen(env.PORT, () => {
      console.log(`[Server] Running on port ${env.PORT}`);
      console.log(`[Socket] Ready for connections`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

start();

// ─── Graceful Shutdown ──────────────────────────────
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down...');
  await disconnectDatabase();
  /* await disconnectRedis(); */
  httpServer.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received, shutting down...');
  await disconnectDatabase();
  /* await disconnectRedis(); */
  httpServer.close();
  process.exit(0);
});
