import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { RoomState, PlayerSession, GameSettings, RoundData, AuthenticatedSocket, GameMode } from '../types';
import { generateRoomCode, generateUniqueRoomCode, RoomService } from '../services/room.service';
import { awardXP, XP_REWARDS, getLevelProgress } from '../services/xp.service';
import { checkAndAwardAchievement } from '../services/achievements.service';
import { updateLeaderboard } from '../services/leaderboard.service';
import { setUserOnline, setUserOffline } from '../services/friends.service';
import { generateQuestions, QuestionData } from '../services/question.service';
import { setIO } from './export';
import { config } from '../config';
import { logger } from '../utils/logger';
import { getRedis } from '../redis';
import { getPrisma } from '../database';

const PREVIEW_DURATION = 10;
const ANSWER_DURATION = 15;
const COUNTDOWN_SECONDS = 3;

const userSocketMap = new Map<string, string>();

function getUserIdFromToken(token?: string): { userId?: string } | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export function setupSocketHandlers(io: Server, prisma: PrismaClient, redis: Redis, roomService: RoomService) {
  setIO(io);

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const authToken = socket.handshake.auth?.token || socket.handshake.query?.token;
    const cookieHeader = (socket.request as any)?.headers?.cookie || '';
    const cookieToken = cookieHeader.split(';').find((c: string) => c.trim().startsWith('token='))?.split('=')[1];
    const token = authToken || cookieToken || '';
    const authData = getUserIdFromToken(token as string);

    if (authData?.userId) {
      socket.userId = authData.userId;
      const user = await prisma.user.findUnique({ where: { id: authData.userId } });
      if (user) {
        socket.username = user.username;
        socket.avatar = user.avatar || '';
        await setUserOnline(authData.userId, socket.id);
        userSocketMap.set(authData.userId, socket.id);
        io.emit('friend:online', authData.userId);
      }
    }

    socket.on('room:join', (code: string) => handleJoin(socket, code, io, prisma, roomService));
    socket.on('room:leave', () => handleLeave(socket, io, roomService));
    socket.on('room:ready', () => handleReady(socket, io, roomService));
    socket.on('room:chat', (message: string) => handleChat(socket, message, io, roomService));
    socket.on('room:update-settings', (settings: Partial<GameSettings>) => handleUpdateSettings(socket, settings, io, roomService));
    socket.on('room:kick', (playerId: string) => handleKick(socket, playerId, io, roomService));
    socket.on('room:ban', (playerId: string) => handleBan(socket, playerId, io, prisma, roomService));
    socket.on('room:typing', (isTyping: boolean) => handleTyping(socket, isTyping, io, roomService));
    socket.on('room:password', (password: string) => handlePassword(socket, password, io, roomService));
    socket.on('game:start', () => handleGameStart(socket, io, prisma, redis, roomService));
    socket.on('answer:submit', (answer: string) => handleAnswer(socket, answer, io, prisma, roomService));
    socket.on('player:reconnect', (roomCode: string) => handleReconnect(socket, roomCode, io, roomService));

    socket.on('disconnect', async () => {
      await handleDisconnect(socket, io, roomService);
    });
  });
}

function findPlayer(socket: AuthenticatedSocket, room: RoomState): PlayerSession | undefined {
  return [...room.players.values()].find((p) => p.socketId === socket.id) ||
         [...room.spectators.values()].find((p) => p.socketId === socket.id);
}

function serializePlayer(player: PlayerSession | undefined) {
  if (!player) return null;
  return {
    id: player.id,
    userId: player.userId,
    username: player.username,
    avatar: player.avatar,
    score: player.score,
    correctAnswers: player.correctAnswers,
    totalAnswers: player.totalAnswers,
    avgResponseTime: player.avgResponseTime,
    rank: player.rank,
    isHost: player.isHost,
    isReady: player.isReady,
    isSpectator: player.isSpectator,
    isAlive: player.isAlive,
  };
}

function serializePlayers(room: RoomState) {
  return [...room.players.values()]
    .sort((a, b) => b.score - a.score)
    .filter((p) => !p.kicked)
    .map(serializePlayer);
}

function serializeRoom(room: RoomState) {
  return {
    code: room.code,
    host: serializePlayer([...room.players.values()].find((p) => p.isHost)),
    players: serializePlayers(room),
    spectators: [...room.spectators.values()].map(serializePlayer),
    settings: { ...room.settings, password: undefined },
    status: room.status,
    mode: room.mode,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
  };
}

function calculateScore(responseTimeSeconds: number): { basePoints: number; speedBonus: number; totalPoints: number; speedTier: string } {
  const basePoints = 500;
  let speedBonus: number;
  let speedTier: string;

  if (responseTimeSeconds < 1) {
    speedBonus = 1000;
    speedTier = 'legendary';
  } else if (responseTimeSeconds < 2) {
    speedBonus = 800;
    speedTier = 'lightning';
  } else if (responseTimeSeconds < 3) {
    speedBonus = 600;
    speedTier = 'blazing';
  } else if (responseTimeSeconds < 4) {
    speedBonus = 400;
    speedTier = 'fast';
  } else if (responseTimeSeconds < 5) {
    speedBonus = 250;
    speedTier = 'quick';
  } else if (responseTimeSeconds < 7) {
    speedBonus = 150;
    speedTier = 'decent';
  } else if (responseTimeSeconds < 10) {
    speedBonus = 75;
    speedTier = 'slow';
  } else {
    speedBonus = 25;
    speedTier = 'barely';
  }

  const totalPoints = basePoints + speedBonus;

  return { basePoints, speedBonus, totalPoints, speedTier };
}

async function handleJoin(socket: AuthenticatedSocket, code: string, io: Server, prisma: PrismaClient, roomService: RoomService) {
  if (code === 'CREATE') {
    const roomCode = await generateUniqueRoomCode(getRedis());
    const playerId = uuidv4();

    const player: PlayerSession = {
      id: playerId,
      userId: socket.userId,
      username: socket.username || `Player${playerId.slice(0, 4)}`,
      avatar: socket.avatar || '',
      score: 0, correctAnswers: 0, totalAnswers: 0,
      avgResponseTime: 0, rank: 0,
      isHost: true, isReady: false, isSpectator: false, isAlive: true,
      socketId: socket.id, hasGuessed: false,
    };

    const room: RoomState = {
      code: roomCode,
      hostId: playerId,
      players: new Map([[playerId, player]]),
      spectators: new Map(),
      settings: {
        rounds: 10, guessTime: ANSWER_DURATION, category: 'pop', difficulty: 'medium',
        isPrivate: false, maxPlayers: 10, allowSpectators: true, mode: 'CLASSIC',
      },
      status: 'WAITING', currentRound: 0, rounds: [],
      mode: 'CLASSIC', bannedPlayers: new Set(), maxPlayers: 10,
    };

    await roomService.createRoom(room);
    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    io.to(roomCode).emit('room:joined', serializeRoom(room));
    return;
  }

  let room = await roomService.getRoom(code);
  if (!room) {
    socket.emit('error', 'Room not found');
    return;
  }

  const existingPlayer = [...room.players.values(), ...room.spectators.values()]
    .find(p => p.socketId === socket.id);
  if (existingPlayer) {
    socket.join(code);
    socket.data.roomCode = code;
    socket.emit('room:joined', serializeRoom(room));
    return;
  }

  const existingUser = [...room.players.values(), ...room.spectators.values()]
    .find(p => socket.userId && p.userId && p.userId === socket.userId);
  if (existingUser) {
    existingUser.socketId = socket.id;
    await roomService.createRoom(room);
    socket.join(code);
    socket.data.roomCode = code;
    socket.emit('room:joined', serializeRoom(room));
    return;
  }

  if (room.bannedPlayers.has(socket.userId || '')) {
    socket.emit('error', 'You are banned from this room');
    return;
  }

  if (room.password && !socket.data.passwordVerified) {
    socket.emit('room:password-required');
    socket.data.pendingRoom = code;
    return;
  }

  const isSpectator = room.status === 'PLAYING';
  if (room.status !== 'WAITING' && !room.settings.allowSpectators && !isSpectator) {
    socket.emit('error', 'Game already in progress');
    return;
  }

  if (!isSpectator && room.players.size >= room.maxPlayers) {
    socket.emit('error', 'Room is full');
    return;
  }

  const playerId = uuidv4();
  const player: PlayerSession = {
    id: playerId,
    userId: socket.userId,
    username: socket.username || `Player${playerId.slice(0, 4)}`,
    avatar: socket.avatar || '',
    score: 0, correctAnswers: 0, totalAnswers: 0,
    avgResponseTime: 0, rank: 0,
    isHost: room.players.size === 0 && room.status === 'WAITING',
    isReady: false, isSpectator, isAlive: true,
    socketId: socket.id, hasGuessed: false,
  };

  if (isSpectator) {
    room.spectators.set(playerId, player);
  } else {
    room.players.set(playerId, player);
  }

  await roomService.createRoom(room);
  socket.join(code);
  socket.data.roomCode = code;

  io.to(code).emit('room:player-joined', serializePlayer(player));
  socket.emit('room:joined', serializeRoom(room));
}

async function handleLeave(socket: AuthenticatedSocket, io: Server, roomService: RoomService) {
  const code = socket.data.roomCode;
  if (!code) return;

  const room = await roomService.getRoom(code);
  if (!room) return;

  const player = findPlayer(socket, room);
  if (!player) return;

  room.players.delete(player.id);
  room.spectators.delete(player.id);

  if (player.kicked) {
    socket.leave(code);
    socket.data.roomCode = null;
    socket.emit('room:kicked');
    io.to(code).emit('room:player-left', player.id);
    return;
  }

  io.to(code).emit('room:player-left', player.id);

  if (room.players.size === 0 && room.spectators.size === 0) {
    await roomService.deleteRoom(code);
    socket.leave(code);
    socket.data.roomCode = null;
    return;
  }

  if (player.isHost && room.players.size > 0) {
    const newHost = [...room.players.values()][0];
    newHost.isHost = true;
    room.hostId = newHost.id;
    io.to(code).emit('room:host-migrated', newHost.id);
  }

  await roomService.createRoom(room);

  if (room.players.size > 0) {
    io.to(code).emit('room:joined', serializeRoom(room));
  }

  socket.leave(code);
  socket.data.roomCode = null;
}

async function handleKick(socket: AuthenticatedSocket, targetId: string, io: Server, roomService: RoomService) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = await roomService.getRoom(code);
  if (!room) return;

  const host = findPlayer(socket, room);
  if (!host?.isHost) return;

  const target = room.players.get(targetId) || room.spectators.get(targetId);
  if (!target) return;

  target.kicked = true;
  const targetSocket = io.sockets.sockets.get(target.socketId);
  if (targetSocket) {
    await handleLeave(targetSocket as AuthenticatedSocket, io, roomService);
  }
  io.to(code).emit('room:player-kicked', targetId);
}

async function handleBan(socket: AuthenticatedSocket, targetId: string, io: Server, prisma: PrismaClient, roomService: RoomService) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = await roomService.getRoom(code);
  if (!room) return;

  const host = findPlayer(socket, room);
  if (!host?.isHost) return;

  const target = room.players.get(targetId) || room.spectators.get(targetId);
  if (!target) return;

  if (target.userId) {
    room.bannedPlayers.add(target.userId);
    await prisma.roomBan.upsert({
      where: { roomCode_userId: { roomCode: code, userId: target.userId } },
      update: {},
      create: { roomCode: code, userId: target.userId, bannedBy: socket.userId || '' },
    }).catch(() => {});
  }

  target.kicked = true;
  const targetSocket = io.sockets.sockets.get(target.socketId);
  if (targetSocket) {
    await handleLeave(targetSocket as AuthenticatedSocket, io, roomService);
  }
  io.to(code).emit('room:player-kicked', targetId);
}

async function handleTyping(socket: AuthenticatedSocket, isTyping: boolean, io: Server, roomService: RoomService) {
  const code = socket.data.roomCode;
  if (!code) return;
  if (isTyping) {
    socket.to(code).emit('room:typing', socket.userId, socket.username || '');
  } else {
    socket.to(code).emit('room:typing', null, '');
  }
}

async function handlePassword(socket: AuthenticatedSocket, password: string, io: Server, roomService: RoomService) {
  const code = socket.data.pendingRoom;
  if (!code) return;

  const room = await roomService.getRoom(code);
  if (!room || room.password !== password) {
    socket.emit('error', 'Incorrect password');
    return;
  }

  socket.data.passwordVerified = true;
  socket.emit('room:password-correct');
  await handleJoin(socket, code, io, getPrisma(), roomService);
}

async function handleReady(socket: AuthenticatedSocket, io: Server, roomService: RoomService) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = await roomService.getRoom(code);
  if (!room || room.status !== 'WAITING') return;

  const player = findPlayer(socket, room);
  if (!player || player.isSpectator) return;

  player.isReady = !player.isReady;
  await roomService.createRoom(room);
  io.to(code).emit('room:player-ready', player.id, player.isReady);
}

async function handleChat(socket: AuthenticatedSocket, message: string, io: Server, roomService: RoomService) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = await roomService.getRoom(code);
  if (!room) return;

  const player = findPlayer(socket, room);
  if (!player) return;

  io.to(code).emit('room:chat-message', {
    id: uuidv4(),
    userId: player.userId,
    username: player.username,
    message: message.slice(0, 200),
    timestamp: Date.now(),
  });
}

async function handleUpdateSettings(socket: AuthenticatedSocket, settings: Partial<GameSettings>, io: Server, roomService: RoomService) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = await roomService.getRoom(code);
  if (!room || room.status !== 'WAITING') return;

  const player = findPlayer(socket, room);
  if (!player || !player.isHost) return;

  Object.assign(room.settings, settings);
  if (settings.mode) room.mode = settings.mode as GameMode;
  await roomService.createRoom(room);
  io.to(code).emit('room:settings-updated', room.settings);
}

async function handleGameStart(socket: AuthenticatedSocket, io: Server, prisma: PrismaClient, redis: Redis, roomService: RoomService) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = await roomService.getRoom(code);
  if (!room) return;

  const player = findPlayer(socket, room);
  if (!player || !player.isHost) return;

  if (room.players.size < 1) {
    socket.emit('error', 'Need at least 1 player to start');
    return;
  }

  room.status = 'PLAYING';
  room.currentRound = 0;
  room.rounds = [];

  room.players.forEach((p) => {
    p.score = 0;
    p.correctAnswers = 0;
    p.totalAnswers = 0;
    p.avgResponseTime = 0;
    p.rank = 0;
    p.hasGuessed = false;
    p.isAlive = true;
    p.eliminatedAt = undefined;
  });

  const isSurvival = room.mode === 'SURVIVAL';
  const isHardcore = room.mode === 'HARDCORE';

  io.to(code).emit('game:mode-info', room.mode, {
    survival: isSurvival,
    hardcore: isHardcore,
    rounds: room.settings.rounds,
    guessTime: ANSWER_DURATION,
  });

  const totalRounds = isHardcore ? Math.min(room.settings.rounds, 5) : room.settings.rounds;

  let questions: QuestionData[];
  try {
    questions = await generateQuestions(prisma, redis, room.settings.category, totalRounds);
  } catch (error) {
    logger.error('Failed to generate questions', { error: String(error) });
    socket.emit('error', 'Failed to load songs. Please try again.');
    room.status = 'WAITING';
    await roomService.createRoom(room);
    return;
  }

  room.rounds = questions.map((q, i) => ({
    roundNumber: i + 1,
    mode: room.mode,
    songId: q.song.deezerId,
    songTitle: q.song.title,
    artist: q.song.artist,
    album: q.song.album,
    albumArt: q.song.albumArt,
    previewUrl: q.song.previewUrl,
    duration: ANSWER_DURATION,
    options: q.options,
    correctIndex: q.correctIndex,
  }));

  await roomService.createRoom(room);
  startCountdown(io, code, room, prisma, roomService);
}

function startCountdown(io: Server, code: string, room: RoomState, prisma: PrismaClient, roomService: RoomService) {
  let countdown = COUNTDOWN_SECONDS;

  io.to(code).emit('game:countdown', countdown);

  const timer = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      io.to(code).emit('game:countdown', countdown);
    } else {
      clearInterval(timer);
      io.to(code).emit('game:countdown', 0);
      startRound(io, code, room, prisma, roomService);
    }
  }, 1000);
}

function startRound(io: Server, code: string, room: RoomState, prisma: PrismaClient, roomService: RoomService) {
  if (room.currentRound >= room.rounds.length) {
    endGame(io, code, room, prisma, roomService);
    return;
  }

  const round = room.rounds[room.currentRound];
  room.roundStartTime = Date.now();

  const alivePlayers = [...room.players.values()].filter((p) => p.isAlive);
  alivePlayers.forEach((p) => {
    p.hasGuessed = false;
    p.guessTime = undefined;
  });

  io.to(code).emit('round:start', {
    roundNumber: round.roundNumber,
    totalRounds: room.rounds.length,
    mode: room.mode,
    song: {
      albumArt: round.albumArt,
      artist: round.artist,
      album: round.album,
      songTitle: round.songTitle,
      previewUrl: round.previewUrl,
    },
    options: round.options,
    duration: PREVIEW_DURATION + ANSWER_DURATION,
  });

  setTimeout(() => {
    io.to(code).emit('song:play', round.previewUrl, PREVIEW_DURATION);

    let timeLeft = PREVIEW_DURATION;
    const previewInterval = setInterval(() => {
      timeLeft--;
      io.to(code).emit('timer:update', timeLeft);
      if (timeLeft <= 0) {
        clearInterval(previewInterval);
        startAnswerPhase(io, code, room, prisma, roomService);
      }
    }, 1000);
  }, 500);
}

function startAnswerPhase(io: Server, code: string, room: RoomState, prisma: PrismaClient, roomService: RoomService) {
  let timeLeft = ANSWER_DURATION;

  io.to(code).emit('timer:update', timeLeft);

  const answerTimeout = setTimeout(() => {
    endRound(io, code, room, prisma, roomService);
  }, ANSWER_DURATION * 1000);

  const answerInterval = setInterval(() => {
    timeLeft--;
    io.to(code).emit('timer:update', timeLeft);
    if (timeLeft <= 0) {
      clearInterval(answerInterval);
    }
  }, 1000);

  (room as any)._answerTimeout = answerTimeout;
  (room as any)._answerInterval = answerInterval;
}

async function handleAnswer(socket: AuthenticatedSocket, answer: string, io: Server, prisma: PrismaClient, roomService: RoomService) {
  const code = socket.data.roomCode;
  if (!code) return;

  const room = await roomService.getRoom(code);
  if (!room || room.status !== 'PLAYING') return;

  const player = findPlayer(socket, room);
  if (!player || player.hasGuessed || !player.isAlive) return;

  const round = room.rounds[room.currentRound];
  if (!round) return;

  const guessTime = (Date.now() - (room.roundStartTime || Date.now())) / 1000;
  const isCorrect = answer.trim().toLowerCase() === round.options[round.correctIndex].toLowerCase();
  const scoreResult = isCorrect ? calculateScore(guessTime) : { basePoints: 0, speedBonus: 0, totalPoints: 0, speedTier: 'wrong' };
  const points = scoreResult.totalPoints;

  player.hasGuessed = true;
  player.guessTime = guessTime;
  player.score = Math.max(0, player.score + points);
  player.totalAnswers++;
  player.avgResponseTime = ((player.avgResponseTime * (player.totalAnswers - 1)) + guessTime) / player.totalAnswers;

  if (isCorrect) {
    player.correctAnswers++;
  }

  if (room.mode === 'SURVIVAL' && !isCorrect) {
    player.isAlive = false;
    player.eliminatedAt = Date.now();
  }

  await roomService.createRoom(room);

  const correctAnswer = round.options[round.correctIndex];
  socket.emit('answer:reveal', {
    correctIndex: round.correctIndex,
    correctAnswer,
    points,
    basePoints: scoreResult.basePoints,
    speedBonus: scoreResult.speedBonus,
    speedTier: scoreResult.speedTier,
    responseTime: Math.round(guessTime * 10) / 10,
    wasCorrect: isCorrect,
  });

  io.to(code).emit('score:update', serializePlayers(room));

  const allGuessed = [...room.players.values()]
    .filter((p) => p.isAlive)
    .every((p) => p.hasGuessed);

  if (allGuessed) {
    if ((room as any)._answerTimeout) clearTimeout((room as any)._answerTimeout);
    if ((room as any)._answerInterval) clearInterval((room as any)._answerInterval);
    (room as any)._answerTimeout = undefined;
    (room as any)._answerInterval = undefined;
    setTimeout(() => endRound(io, code, room, prisma, roomService), 500);
  }
}

async function endRound(io: Server, code: string, room: RoomState, prisma: PrismaClient, roomService: RoomService) {
  if ((room as any)._answerTimeout) clearTimeout((room as any)._answerTimeout);
  if ((room as any)._answerInterval) clearInterval((room as any)._answerInterval);
  (room as any)._answerTimeout = undefined;
  (room as any)._answerInterval = undefined;

  const round = room.rounds[room.currentRound];
  const playerArray = [...room.players.values()].sort((a, b) => b.score - a.score);
  playerArray.forEach((p, i) => (p.rank = i + 1));

  const correctAnswer = round.options[round.correctIndex];

  io.to(code).emit('round:end', {
    roundNumber: round.roundNumber,
    players: serializePlayers(room),
    correctAnswer,
  });

  io.to(code).emit('score:update', serializePlayers(room));

  room.currentRound++;
  await roomService.createRoom(room);

  setTimeout(() => {
    if (room.currentRound >= room.rounds.length) {
      endGame(io, code, room, prisma, roomService);
    } else if (room.mode === 'SURVIVAL') {
      const alivePlayers = [...room.players.values()].filter((p) => p.isAlive);
      if (alivePlayers.length <= 1) {
        endGame(io, code, room, prisma, roomService);
      } else {
        startRound(io, code, room, prisma, roomService);
      }
    } else {
      startRound(io, code, room, prisma, roomService);
    }
  }, 4000);
}

async function endGame(io: Server, code: string, room: RoomState, prisma: PrismaClient, roomService: RoomService) {
  room.status = 'FINISHED';

  const sortedPlayers = [...room.players.values()].sort((a, b) => b.score - a.score);
  sortedPlayers.forEach((p, i) => (p.rank = i + 1));

  io.to(code).emit('game:end', serializePlayers(room));

  try {
    const game = await prisma.game.create({
      data: {
        roomCode: code,
        mode: room.mode,
        status: 'FINISHED',
        settings: room.settings as any,
        endedAt: new Date(),
        players: {
          create: sortedPlayers.map((p) => ({
            userId: p.userId,
            username: p.username,
            avatar: p.avatar,
            score: p.score,
            correctAnswers: p.correctAnswers,
            totalAnswers: p.totalAnswers,
            avgResponseTime: p.avgResponseTime,
            rank: p.rank,
            isHost: p.isHost,
            isReady: p.isReady,
            isSpectator: p.isSpectator,
            isAlive: p.isAlive,
            hasGuessed: p.hasGuessed,
          })),
        },
      },
    });

    for (const p of sortedPlayers) {
      if (!p.userId) continue;

      const xpGain = p.score +
        (p.rank === 1 ? XP_REWARDS.WIN_GAME :
         p.rank === 2 ? XP_REWARDS.SECOND_PLACE :
         p.rank === 3 ? XP_REWARDS.THIRD_PLACE : 0);

      await awardXP(p.userId, xpGain, 'Game completed');

      const userUpdate: any = { totalGames: { increment: 1 } };
      if (p.rank === 1) userUpdate.wins = { increment: 1 };

      await prisma.user.update({ where: { id: p.userId }, data: userUpdate });

      if (p.rank === 1) {
        const [wins, winStreak] = await Promise.all([
          prisma.gamePlayer.count({ where: { userId: p.userId, rank: 1 } }),
          calculateWinStreak(prisma, p.userId),
        ]);
        await prisma.user.update({
          where: { id: p.userId },
          data: { winStreak },
        });

        const checks: Promise<boolean>[] = [];
        if (wins === 1) checks.push(checkAndAwardAchievement(p.userId, 'FIRST_WIN'));
        if (wins >= 10) checks.push(checkAndAwardAchievement(p.userId, 'WIN_10'));
        if (wins >= 100) checks.push(checkAndAwardAchievement(p.userId, 'CENTURY_CLUB'));
        if (winStreak >= 3) checks.push(checkAndAwardAchievement(p.userId, 'WIN_STREAK_3'));
        if (winStreak >= 5) checks.push(checkAndAwardAchievement(p.userId, 'WIN_STREAK_5'));
        if (winStreak >= 10) checks.push(checkAndAwardAchievement(p.userId, 'WIN_STREAK_10'));
        await Promise.all(checks);
      }

      if (p.totalAnswers > 0) {
        const accuracy = p.correctAnswers / p.totalAnswers;
        await prisma.user.update({ where: { id: p.userId }, data: { accuracy } }).catch(() => {});
      }

      const checks: Promise<boolean>[] = [];
      const totalUserGames = await prisma.gamePlayer.count({ where: { userId: p.userId } });
      if (totalUserGames >= 100) checks.push(checkAndAwardAchievement(p.userId, 'PLAY_100'));
      if (totalUserGames >= 500) checks.push(checkAndAwardAchievement(p.userId, 'PLAY_500'));
      if (p.correctAnswers >= 100) checks.push(checkAndAwardAchievement(p.userId, 'CORRECT_100'));
      if (p.avgResponseTime > 0 && p.avgResponseTime < 3) checks.push(checkAndAwardAchievement(p.userId, 'FAST_FINGERS'));
      if (p.correctAnswers === room.rounds.length) checks.push(checkAndAwardAchievement(p.userId, 'PERFECT_GAME'));
      if (room.mode === 'SURVIVAL' && p.rank === 1) checks.push(checkAndAwardAchievement(p.userId, 'SURVIVOR'));
      if (room.mode === 'HARDCORE' && p.rank === 1) checks.push(checkAndAwardAchievement(p.userId, 'HARDCORE_CLEAR'));
      if (room.players.size >= 8) checks.push(checkAndAwardAchievement(p.userId, 'PARTY_ANIMAL'));

      await Promise.all(checks);

      const socketId = userSocketMap.get(p.userId);
      if (socketId) {
        const user = await prisma.user.findUnique({ where: { id: p.userId }, select: { xp: true } });
        if (user) {
          const xpInfo = getLevelProgress(user.xp);
          io.to(socketId).emit('xp:update', xpInfo.currentXP, xpInfo.level);
        }
      }
    }

    await Promise.all(
      sortedPlayers
        .filter((p) => p.userId)
        .map((p) => updateLeaderboard(p.userId!))
    );
  } catch (error) {
    logger.error('Failed to save game', { error: String(error) });
  }

  await roomService.deleteRoom(code);
  setTimeout(() => {}, 1000);
}

async function calculateWinStreak(prisma: PrismaClient, userId: string): Promise<number> {
  const recentGames = await prisma.gamePlayer.findMany({
    where: { userId, rank: 1 },
    orderBy: { game: { createdAt: 'desc' } },
    take: 10,
    include: { game: true },
  });

  let streak = 0;
  for (const g of recentGames) {
    if (g.rank === 1) streak++;
    else break;
  }
  return streak;
}

async function handleReconnect(socket: AuthenticatedSocket, roomCode: string, io: Server, roomService: RoomService) {
  const room = await roomService.getRoom(roomCode);
  if (!room) {
    socket.emit('error', 'Room no longer available');
    return;
  }

  const player = [...room.players.values()].find((p) => p.userId === socket.userId);
  const spectator = [...room.spectators.values()].find((p) => p.userId === socket.userId);

  if (!player && !spectator) {
    socket.emit('error', 'Not a member of this room');
    return;
  }

  const target = player || spectator;
  if (!target) return;

  target.socketId = socket.id;
  socket.join(roomCode);
  socket.data.roomCode = roomCode;

  await roomService.createRoom(room);

  socket.emit('room:joined', serializeRoom(room));

  if (room.status === 'PLAYING') {
    const round = room.rounds[room.currentRound];
    if (round) {
      socket.emit('round:start', {
        roundNumber: round.roundNumber,
        totalRounds: room.rounds.length,
        mode: room.mode,
        song: {
          albumArt: round.albumArt,
          artist: round.artist,
          album: round.album,
          songTitle: round.songTitle,
          previewUrl: round.previewUrl,
        },
        options: round.options,
        duration: PREVIEW_DURATION + ANSWER_DURATION,
      });
    }
    socket.emit('score:update', serializePlayers(room));
  }

  io.to(roomCode).emit('player:reconnected', target.id);
}

async function handleDisconnect(socket: AuthenticatedSocket, io: Server, roomService: RoomService) {
  const code = socket.data.roomCode;

  if (socket.userId) {
    await setUserOffline(socket.userId);
    io.emit('friend:offline', socket.userId);
    userSocketMap.delete(socket.userId);
  }

  if (code) {
    const room = await roomService.getRoom(code);
    if (room && room.status === 'WAITING') {
      await handleLeave(socket, io, roomService);
    } else if (room) {
      const player = findPlayer(socket, room);
      if (player) {
        io.to(code).emit('room:player-left', player.id);
      }
    }
  }
}

export function getIO(): Server {
  return (global as any).io;
}
