import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { errorHandler } from '../src/middleware/error.js';
import { setupSocketHandlers } from '../src/socket/index.js';
import authRoutes from '../src/routes/auth.js';
import userRoutes from '../src/routes/users.js';
import friendRoutes from '../src/routes/friends.js';
import notificationRoutes from '../src/routes/notifications.js';
import healthRoutes from '../src/routes/health.js';
import leaderboardRoutes from '../src/routes/leaderboard.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 20000,
  transports: ['websocket'],
  maxHttpBufferSize: 1e6,
});

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression({ level: 6, threshold: 256 }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use(errorHandler);

setupSocketHandlers(io);

export default httpServer;
