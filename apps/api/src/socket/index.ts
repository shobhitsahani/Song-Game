import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { getRedis } from '../config/redis.js';
import type { JWTPayload, SafeUser, Player, GameMode } from '@song-game/types';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom,
  getRoomState,
  findRoomBySocketId,
  setPlayerSocketId,
  toggleReady,
  updateSettings,
  kickPlayer,
  banPlayer,
  startGame,
  resetRoomGame,
  deleteRoom,
  getPublicRooms,
  setUserSocketId,
  getUserSocketId,
  removeUserSocketId,
  serializeRoom,
  findPlayerInRoom,
  findPlayerByUserId,
  addChatMessage,
  getChatHistory,
  type RoomState,
  type GameRound,
} from '../services/room.service.js';
import { generateQuestions } from '../services/question.service.js';
import { setUserOnline, setUserOffline } from '../services/friend.service.js';
import { toSafeUser } from '../services/auth.service.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  avatar?: string;
  roomCode?: string;
}

const PREVIEW_DURATION = 10;
const ANSWER_DURATION = 15;
const COUNTDOWN_SECONDS = 3;
const ROUND_BREAK_MS = 4000;

interface GameTimers {
  audioTimeout?: ReturnType<typeof setTimeout>;
  phaseInterval?: ReturnType<typeof setInterval>;
  roundTimeout?: ReturnType<typeof setTimeout>;
}

const gameTimers = new Map<string, GameTimers>();
const startingGames = new Set<string>();

function clearGameTimers(code: string): void {
  const timers = gameTimers.get(code);
  if (!timers) return;
  if (timers.audioTimeout) clearTimeout(timers.audioTimeout);
  if (timers.phaseInterval) clearInterval(timers.phaseInterval);
  if (timers.roundTimeout) clearTimeout(timers.roundTimeout);
  gameTimers.delete(code);
  startingGames.delete(code);
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

function serializePlayers(room: RoomState): Player[] {
  return [...room.players.values()]
    .sort((a, b) => b.score - a.score)
    .filter((p) => !p.kicked);
}

function serializeRound(room: RoomState, round: GameRound) {
  return {
    roundNumber: round.roundNumber,
    totalRounds: room.rounds.length,
    mode: room.mode,
    duration: PREVIEW_DURATION + (room.settings.guessTime || ANSWER_DURATION),
    songTitle: round.songTitle,
    artist: round.artist,
    album: round.album,
    albumArt: round.albumArt,
    previewUrl: round.previewUrl,
    options: round.options,
  };
}

function resyncPlayingRound(socket: AuthenticatedSocket, roomState: RoomState): void {
  if (roomState.status !== 'PLAYING') return;
  const round = roomState.rounds[roomState.currentRound];
  if (round) {
    socket.emit('game:round-start', serializeRound(roomState, round));
    socket.emit('game:timer-update', roomState.timeLeft ?? 0);
    if (roomState.phase === 'answer') {
      socket.emit('game:audio-play', round.previewUrl, PREVIEW_DURATION);
    }
  }
  socket.emit('game:leaderboard', serializePlayers(roomState));
}

export function setupSocketHandlers(io: Server): void {
  io.on('connection', async (socket: AuthenticatedSocket) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token && typeof token === 'string') {
      try {
        const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
        if (payload.type === 'access') {
          socket.userId = payload.userId;
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { username: true, avatar: true, displayName: true },
          });
          if (user) {
            socket.username = user.displayName || user.username;
            socket.avatar = user.avatar || '';
            await setUserOnline(payload.userId, socket.id);
            setUserSocketId(payload.userId, socket.id);
            io.emit('friend:online', payload.userId);
          }
        }
      } catch {
        // Token invalid, proceed as anonymous
      }
    }

    // ─── Room Handlers ─────────────────────────────────
    socket.on('room:create', (data?: { username?: string; avatar?: string }) => {
      const username = data?.username || socket.username || `Player_${socket.id.slice(0, 4)}`;
      const avatar = data?.avatar || socket.avatar || null;
      const { room, playerId } = createRoom(socket.userId, username, avatar);
      setPlayerSocketId(playerId, socket.id, room.code);
      socket.join(room.code);
      socket.roomCode = room.code;
      socket.emit('room:joined', room);
      socket.emit('room:chat-history', getChatHistory(room.code));
    });

    socket.on('room:join', (code: string, data?: { username?: string; playerId?: string; avatar?: string }) => {
      if (code === 'CREATE') {
        const username = data?.username || socket.username || `Player_${socket.id.slice(0, 4)}`;
        const avatar = data?.avatar || socket.avatar || null;
        const { room, playerId } = createRoom(socket.userId, username, avatar);
        setPlayerSocketId(playerId, socket.id, room.code);
        socket.join(room.code);
        socket.roomCode = room.code;
        socket.emit('room:joined', room);
        socket.emit('room:chat-history', getChatHistory(room.code));
        return;
      }

      const roomState = getRoomState(code);
      const existing = roomState && findPlayerInRoom(socket.id, roomState);
      if (existing) {
        socket.join(code);
        socket.roomCode = code;
        socket.emit('room:joined', serializeRoom(roomState));
        socket.emit('room:chat-history', getChatHistory(code));
        return;
      }

      // Reconnection: same player re-joining after a disconnect with a new socket id.
      if (roomState && data?.playerId) {
        const player = roomState.players.get(data.playerId) || roomState.spectators.get(data.playerId);
        const usernameMatch = !data.username || player?.username === data.username;
        if (player && !player.kicked && usernameMatch && (player.userId === socket.userId || !player.userId)) {
          player.socketId = socket.id;
          socket.join(code);
          socket.roomCode = code;
          socket.emit('room:joined', serializeRoom(roomState));
          socket.emit('room:chat-history', getChatHistory(code));
          resyncPlayingRound(socket, roomState);
          return;
        }
      }

      // Reconnection by userId (JWT-authenticated players, e.g. after a page refresh).
      if (roomState && socket.userId) {
        const player = findPlayerByUserId(socket.userId, roomState);
        if (player && !player.kicked) {
          player.socketId = socket.id;
          socket.join(code);
          socket.roomCode = code;
          socket.emit('room:joined', serializeRoom(roomState));
          socket.emit('room:chat-history', getChatHistory(code));
          resyncPlayingRound(socket, roomState);
          return;
        }
      }

      const joinUsername = data?.username || socket.username || `Player_${socket.id.slice(0, 4)}`;
      const joinAvatar = data?.avatar || socket.avatar || null;
      const result = joinRoom(socket.id, code, socket.userId, joinUsername, joinAvatar);

      if ('error' in result) {
        socket.emit('error', result.error);
        return;
      }

      socket.join(code);
      socket.roomCode = code;
      socket.emit('room:joined', result.room);
      socket.emit('room:chat-history', getChatHistory(code));
      socket.to(code).emit('room:player-joined', result.player);
    });

    socket.on('room:leave', () => {
      const code = socket.roomCode;
      if (!code) return;

      const result = leaveRoom(socket.id, code);

      if (result.kicked) {
        socket.leave(code);
        socket.roomCode = undefined;
        socket.emit('room:kicked');
        io.to(code).emit('room:player-left', socket.id);
        return;
      }

      socket.to(code).emit('room:player-left', socket.id);

      if (result.updatedRoom) {
        const oldHost = result.updatedRoom.players.find((p) => p.isHost);
        if (oldHost) {
          io.to(code).emit('room:host-migrated', oldHost.id);
        }
        io.to(code).emit('room:joined', result.updatedRoom);
      } else {
        clearGameTimers(code);
      }

      socket.leave(code);
      socket.roomCode = undefined;
    });

    socket.on('room:ready', () => {
      const code = socket.roomCode;
      if (!code) return;
      const player = toggleReady(socket.id, code);
      if (player) {
        io.to(code).emit('room:player-ready', player.id, player.isReady);
      }
    });

    socket.on('room:chat', (message: string) => {
      const code = socket.roomCode;
      if (!code || !message.trim()) return;

      const roomState = getRoomState(code);
      if (!roomState) return;

      const player = findPlayerInRoom(socket.id, roomState);
      if (!player) return;

      const chatMessage = {
        id: crypto.randomUUID(),
        userId: player.userId || undefined,
        username: player.username || 'Unknown',
        message: message.slice(0, 200),
        timestamp: Date.now(),
      };

      addChatMessage(code, chatMessage);
      io.to(code).emit('room:chat-message', chatMessage);
    });

    socket.on('room:update-settings', (settings: Record<string, unknown>) => {
      const code = socket.roomCode;
      if (!code) return;
      const updated = updateSettings(socket.id, code, settings as any);
      if (updated) {
        io.to(code).emit('room:settings-updated', updated);
      }
    });

    socket.on('room:kick', (targetId: string) => {
      const code = socket.roomCode;
      if (!code) return;
      const target = kickPlayer(socket.id, targetId, code);
      if (target) {
        io.to(code).emit('room:player-kicked', targetId);
        const targetSocket = io.sockets.sockets.get(target.socketId) as AuthenticatedSocket | undefined;
        if (targetSocket) {
          targetSocket.emit('room:kicked');
          targetSocket.leave(code);
          targetSocket.roomCode = undefined;
        }
      }
    });

    socket.on('room:ban', async (targetId: string) => {
      const code = socket.roomCode;
      if (!code) return;
      const target = await banPlayer(socket.id, targetId, code, socket.userId);
      if (target) {
        io.to(code).emit('room:player-banned', targetId);
        const targetSocket = io.sockets.sockets.get(target.socketId) as AuthenticatedSocket | undefined;
        if (targetSocket) {
          targetSocket.emit('room:kicked');
          targetSocket.leave(code);
          targetSocket.roomCode = undefined;
        }
      }
    });

    socket.on('room:password', (password: string) => {
      const code = socket.roomCode;
      if (!code) return;
      const roomState = getRoomState(code);
      if (!roomState || roomState.password !== password) {
        socket.emit('error', 'Incorrect password');
        return;
      }
      socket.emit('room:password-correct');
    });

    // ─── Game Handlers ─────────────────────────────────
    socket.on('game:start', async () => {
      const code = socket.roomCode;
      if (!code) {
        socket.emit('error', 'You are not connected to a room. Please rejoin the room.');
        return;
      }

      if (startingGames.has(code)) {
        socket.emit('error', 'Game is already starting. Please wait...');
        return;
      }

      const roomState = getRoomState(code);
      if (!roomState) return;

      const player = findPlayerInRoom(socket.id, roomState);
      if (!player?.isHost) {
        socket.emit('error', 'Only the host can start the game');
        return;
      }
      if (roomState.status !== 'WAITING') {
        socket.emit('error', 'Game already started');
        return;
      }

      startingGames.add(code);

      try {
        const isHardcore = roomState.mode === 'HARDCORE';
        const totalRounds = isHardcore ? Math.min(roomState.settings.rounds, 5) : roomState.settings.rounds;

        let questions;
        try {
          questions = await generateQuestions(roomState.settings.category, totalRounds, roomState.mode);
        } catch (error) {
          console.error('[Game] Failed to generate questions:', error);
          socket.emit('error', 'Failed to load songs. Please try again.');
          return;
        }

        const result = startGame(socket.id, code);
        if ('error' in result) {
          socket.emit('error', result.error);
          return;
        }

        roomState.rounds = questions.map((q) => ({
          roundNumber: q.roundNumber,
          mode: roomState.mode,
          songTitle: q.song.title,
          artist: q.song.artist,
          album: q.song.album,
          albumArt: q.song.albumArt,
          previewUrl: q.song.previewUrl,
          duration: roomState.settings.guessTime || ANSWER_DURATION,
          options: q.options,
          correctIndex: q.correctIndex,
        }));

        io.to(code).emit('game:start', serializeRoom(roomState));
        startCountdown(io, code);
      } finally {
        startingGames.delete(code);
      }
    });

    socket.on('game:guess', (answer: string) => {
      const code = socket.roomCode;
      if (!code) return;

      const roomState = getRoomState(code);
      if (!roomState || roomState.status !== 'PLAYING') return;

      const player = findPlayerInRoom(socket.id, roomState);
      if (!player || player.hasGuessed || !player.isAlive) return;

      const round = roomState.rounds[roomState.currentRound];
      if (!round) return;

      const guessTime = (Date.now() - (roomState.roundStartTime || Date.now())) / 1000;
      const isCorrect = answer.trim().toLowerCase() === round.options[round.correctIndex].toLowerCase();
      const scoreResult = isCorrect
        ? calculateScore(guessTime)
        : { basePoints: 0, speedBonus: 0, totalPoints: 0, speedTier: 'wrong' };

      player.hasGuessed = true;
      player.guessTime = guessTime;
      player.roundPoints = scoreResult.totalPoints;
      player.score = Math.max(0, player.score + scoreResult.totalPoints);
      player.totalAnswers++;
      player.avgResponseTime =
        player.totalAnswers > 1
          ? (player.avgResponseTime * (player.totalAnswers - 1) + guessTime) / player.totalAnswers
          : guessTime;

      if (isCorrect) {
        player.correctAnswers++;
      }

      if (roomState.mode === 'SURVIVAL' && !isCorrect) {
        player.isAlive = false;
        player.eliminatedAt = Date.now();
      }

      socket.emit('game:guess-result', {
        correctIndex: round.correctIndex,
        correctAnswer: round.options[round.correctIndex],
        points: scoreResult.totalPoints,
        basePoints: scoreResult.basePoints,
        speedBonus: scoreResult.speedBonus,
        speedTier: scoreResult.speedTier,
        responseTime: Math.round(guessTime * 10) / 10,
        wasCorrect: isCorrect,
      });

      io.to(code).emit('game:player-guess', { playerId: player.id, option: answer });
      io.to(code).emit('game:leaderboard', serializePlayers(roomState));

      const alivePlayers = [...roomState.players.values()].filter((p) => p.isAlive);
      if (alivePlayers.length > 0 && alivePlayers.every((p) => p.hasGuessed)) {
        const timers = gameTimers.get(code);
        if (timers?.phaseInterval) clearInterval(timers.phaseInterval);
        timers?.roundTimeout && clearTimeout(timers.roundTimeout);
        const t = gameTimers.get(code);
        if (t) {
          t.roundTimeout = setTimeout(() => endRound(io, code), 600);
        }
      }
    });

    // ─── Quick Match ───────────────────────────────────
    socket.on('room:quick-match', () => {
      if (!socket.userId) {
        socket.emit('error', 'Sign in to use quick match');
        return;
      }

      const available = getPublicRooms();
      if (available.length > 0) {
        const target = available[Math.floor(Math.random() * available.length)];
        const result = joinRoom(socket.id, target.code, socket.userId, socket.username || 'Player', socket.avatar || null);
        if (!('error' in result)) {
          socket.join(target.code);
          socket.roomCode = target.code;
          socket.emit('room:joined', result.room);
          socket.emit('room:chat-history', getChatHistory(target.code));
          socket.to(target.code).emit('room:player-joined', result.player);
          return;
        }
      }

      // No public rooms — create one
      const { room } = createRoom(socket.userId, socket.username || 'Player', socket.avatar || null);
      socket.emit('matchmaking:waiting', { mode: 'CLASSIC' });
    });

    // ─── Reconnect ─────────────────────────────────────
    socket.on('player:reconnect', (roomCode: string) => {
      const room = getRoom(roomCode);
      if (!room) {
        socket.emit('error', 'Room no longer available');
        return;
      }

      const roomState = getRoomState(roomCode);
      if (!roomState) return;

      let found = false;
      for (const p of roomState.players.values()) {
        if (p.userId === socket.userId) {
          p.socketId = socket.id;
          found = true;
          break;
        }
      }
      if (!found) {
        for (const p of roomState.spectators.values()) {
          if (p.userId === socket.userId) {
            p.socketId = socket.id;
            found = true;
            break;
          }
        }
      }

      if (found) {
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.emit('room:joined', serializeRoom(roomState));
        socket.emit('room:chat-history', getChatHistory(roomCode));
        io.to(roomCode).emit('player:reconnected', socket.userId);

        if (roomState.status === 'PLAYING') {
          const round = roomState.rounds[roomState.currentRound];
          if (round) {
            socket.emit('game:round-start', serializeRound(roomState, round));
            socket.emit('game:timer-update', roomState.timeLeft ?? 0);
            if (roomState.phase === 'answer') {
              socket.emit('game:audio-play', round.previewUrl, PREVIEW_DURATION);
            }
          }
          socket.emit('game:leaderboard', serializePlayers(roomState));
        }
      }
    });

    // ─── Disconnect ────────────────────────────────────
    socket.on('disconnect', async () => {
      const code = socket.roomCode;
      if (socket.userId) {
        await setUserOffline(socket.userId);
        removeUserSocketId(socket.userId);
        io.emit('friend:offline', socket.userId);
      }

      if (code) {
        const roomState = getRoomState(code);
        if (roomState) {
          const wasPlaying = roomState.status === 'PLAYING';
          socket.to(code).emit('room:player-left', socket.id);

          if (!wasPlaying) {
            const result = leaveRoom(socket.id, code);
            if (result.updatedRoom) {
              io.to(code).emit('room:joined', result.updatedRoom);
            } else {
              clearGameTimers(code);
            }
          }
        }
      }
    });
  });
}

// ─── Game Loop ─────────────────────────────────────────

function startCountdown(io: Server, code: string): void {
  let countdown = COUNTDOWN_SECONDS;

  io.to(code).emit('game:countdown', countdown);

  const timer = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      io.to(code).emit('game:countdown', countdown);
    } else {
      clearInterval(timer);
      io.to(code).emit('game:countdown', 0);
      startRound(io, code);
    }
  }, 1000);
}

function startRound(io: Server, code: string): void {
  const roomState = getRoomState(code);
  if (!roomState) return;

  if (roomState.currentRound >= roomState.rounds.length) {
    endGame(io, code);
    return;
  }

  const round = roomState.rounds[roomState.currentRound];
  const answerDuration = roomState.settings.guessTime || ANSWER_DURATION;
  roomState.roundStartTime = Date.now();
  roomState.phase = 'preview';
  roomState.timeLeft = PREVIEW_DURATION;

  for (const p of roomState.players.values()) {
    if (!p.isAlive) continue;
    p.hasGuessed = false;
    p.guessTime = undefined;
    p.roundPoints = 0;
  }

  io.to(code).emit('game:round-start', serializeRound(roomState, round));
  io.to(code).emit('game:timer-update', PREVIEW_DURATION);

  const timers: GameTimers = {};
  gameTimers.set(code, timers);

  timers.audioTimeout = setTimeout(() => {
    const current = getRoomState(code);
    if (!current) return;
    io.to(code).emit('game:audio-play', round.previewUrl, PREVIEW_DURATION);
  }, 500);

  timers.phaseInterval = setInterval(() => {
    const current = getRoomState(code);
    if (!current || current.status !== 'PLAYING') {
      clearGameTimers(code);
      return;
    }

    if (current.phase === 'preview') {
      current.timeLeft = (current.timeLeft ?? PREVIEW_DURATION) - 1;
      if (current.timeLeft <= 0) {
        current.phase = 'answer';
        current.timeLeft = answerDuration;
        io.to(code).emit('game:timer-update', answerDuration);
      } else {
        io.to(code).emit('game:timer-update', current.timeLeft);
      }
    } else if (current.phase === 'answer') {
      current.timeLeft = (current.timeLeft ?? answerDuration) - 1;
      io.to(code).emit('game:timer-update', current.timeLeft);
      if (current.timeLeft <= 0) {
        clearInterval(timers.phaseInterval!);
        endRound(io, code);
      }
    }
  }, 1000);
}

function endRound(io: Server, code: string): void {
  const roomState = getRoomState(code);
  if (!roomState) return;
  clearGameTimers(code);

  const round = roomState.rounds[roomState.currentRound];
  if (!round) return;

  const playerArray = [...roomState.players.values()].sort((a, b) => b.score - a.score);
  playerArray.forEach((p, i) => (p.rank = i + 1));

  io.to(code).emit('game:round-end', {
    roundNumber: round.roundNumber,
    players: serializePlayers(roomState),
    correctAnswer: round.options[round.correctIndex],
  });

  roomState.currentRound++;
  roomState.phase = undefined;
  roomState.timeLeft = undefined;

  const timers: GameTimers = {};
  gameTimers.set(code, timers);

  timers.roundTimeout = setTimeout(() => {
    const current = getRoomState(code);
    if (!current || current.status !== 'PLAYING') return;

    if (current.mode === 'SURVIVAL') {
      const aliveCount = [...current.players.values()].filter((p) => p.isAlive).length;
      if (aliveCount <= 1) {
        endGame(io, code);
        return;
      }
    }

    startRound(io, code);
  }, ROUND_BREAK_MS);
}

function endGame(io: Server, code: string): void {
  const roomState = getRoomState(code);
  if (!roomState || roomState.status === 'FINISHED') return;
  clearGameTimers(code);

  roomState.status = 'FINISHED';
  roomState.phase = undefined;
  roomState.timeLeft = undefined;

  const sortedPlayers = [...roomState.players.values()].sort((a, b) => b.score - a.score);
  sortedPlayers.forEach((p, i) => (p.rank = i + 1));

  io.to(code).emit('game:end', serializePlayers(roomState));

  resetRoomGame(code);
  io.to(code).emit('room:joined', serializeRoom(roomState));
}
