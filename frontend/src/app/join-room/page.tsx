'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn, ArrowRight, ArrowLeft, Swords, Shuffle, Clock,
  Hash, History, X, Search, Users, Music, Sparkles,
  DoorOpen, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { GAME_MODES } from '@/types';

const RECENT_ROOMS_KEY = 'sg-recent-rooms';

interface RecentRoom {
  code: string;
  mode: string;
  timestamp: number;
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function loadRecentRooms(): RecentRoom[] {
  try {
    const raw = localStorage.getItem(RECENT_ROOMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRecentRooms(rooms: RecentRoom[]) {
  try { localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(rooms.slice(0, 5))); } catch {}
}

function addRecentRoom(code: string, mode: string) {
  const rooms = loadRecentRooms().filter((r) => r.code !== code);
  rooms.unshift({ code, mode, timestamp: Date.now() });
  saveRecentRooms(rooms);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

export default function JoinRoomPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, initialize } = useAuthStore();
  const { socket, connected } = useSocket();

  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    setRecentRooms(loadRecentRooms());
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCodeChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(cleaned);
    setError(null);
  };

  const joinRoom = useCallback((roomCode: string, roomPassword?: string) => {
    if (!socket || !connected) { setError('Not connected to server. Please try again.'); return; }
    if (roomCode.length !== 6) { setError('Room code must be 6 characters.'); return; }

    setJoining(true);
    setError(null);

    socket.emit('room:join', roomCode);

    const onJoined = (data: any) => {
      socket.off('room:joined', onJoined);
      socket.off('error', onError);
      setJoining(false);
      const joinedCode = data?.code || roomCode;
      addRecentRoom(joinedCode, data?.mode || 'CLASSIC');
      router.push(`/room/${joinedCode}`);
    };

    const onError = (err: string | { message: string }) => {
      socket.off('room:joined', onJoined);
      socket.off('error', onError);
      setJoining(false);
      setError(typeof err === 'string' ? err : (err.message || 'Failed to join room.'));
    };

    socket.once('room:joined', onJoined);
    socket.once('error', onError);

    setTimeout(() => {
      socket.off('room:joined', onJoined);
      socket.off('error', onError);
      setJoining(false);
      setError('Request timed out. Server may be unavailable.');
    }, 10000);
  }, [socket, connected, router]);

  const handleJoin = () => joinRoom(code);

  const handleQuickMatch = useCallback(() => {
    if (!socket || !connected) { setError('Not connected to server.'); return; }
    setJoining(true);
    setError(null);

    socket.emit('room:quick-match');

    const onJoined = (data: any) => {
      socket.off('room:joined', onJoined);
      socket.off('error', onError);
      setJoining(false);
      addRecentRoom(data?.code || '', data?.mode || 'CLASSIC');
      router.push(`/room/${data?.code || ''}`);
    };

    const onError = (err: string | { message: string }) => {
      socket.off('room:joined', onJoined);
      socket.off('error', onError);
      setJoining(false);
      setError(typeof err === 'string' ? err : (err.message || 'No rooms available.'));
    };

    socket.once('room:joined', onJoined);
    socket.once('error', onError);

    setTimeout(() => {
      socket.off('room:joined', onJoined);
      socket.off('error', onError);
      setJoining(false);
      setError('Quick match timed out.');
    }, 15000);
  }, [socket, connected, router]);

  const handleRandomRoom = useCallback(() => {
    if (!socket || !connected) { setError('Not connected to server.'); return; }
    setJoining(true);
    setError(null);

    socket.emit('room:random');

    const onJoined = (data: any) => {
      socket.off('room:joined', onJoined);
      socket.off('error', onError);
      setJoining(false);
      addRecentRoom(data?.code || '', data?.mode || 'CLASSIC');
      router.push(`/room/${data?.code || ''}`);
    };

    const onError = (err: string | { message: string }) => {
      socket.off('room:joined', onJoined);
      socket.off('error', onError);
      setJoining(false);
      setError(typeof err === 'string' ? err : (err.message || 'No public rooms found.'));
    };

    socket.once('room:joined', onJoined);
    socket.once('error', onError);

    setTimeout(() => {
      socket.off('room:joined', onJoined);
      socket.off('error', onError);
      setJoining(false);
      setError('Finding a room timed out.');
    }, 15000);
  }, [socket, connected, router]);

  const clearRecentRooms = () => {
    localStorage.removeItem(RECENT_ROOMS_KEY);
    setRecentRooms([]);
  };

  const isValidCode = code.length === 6;

  if (authLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Music className="w-8 h-8 text-purple-400" />
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-background to-purple-900/20 pointer-events-none" />

      <div className="relative z-10 pt-20 pb-16 px-4 max-w-lg mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Button variant="ghost" className="mb-4 -ml-2" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-gradient">Join a Room</span>
            </h1>
            <p className="text-muted-foreground">Enter a room code or find a game to join</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <Card className="glass mb-6 border-white/10 overflow-visible">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DoorOpen className="w-5 h-5 text-purple-400" />
                  Enter Room Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <div className="flex items-center gap-3 mb-2 p-2 rounded-lg bg-secondary/30">
                    <Avatar src={user.avatar} alt={user.username} fallback={user.username?.[0] ?? '?'} className="w-8 h-8" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Joining as </span>
                      <span className="font-semibold">{user.username}</span>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter code"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && isValidCode && handleJoin()}
                    maxLength={6}
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className={`w-full text-center text-2xl md:text-3xl font-bold tracking-[0.5em] h-14 md:h-16 rounded-xl border bg-secondary/50 backdrop-blur-xl px-3 py-2 ring-offset-background transition-all duration-300 placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isValidCode
                        ? 'border-purple-500/70 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/20'
                        : code.length > 0
                          ? 'border-destructive/50'
                          : 'border-border'
                    }`}
                    style={{ fontFamily: "'Courier New', monospace" }}
                    aria-label="Room code"
                  />
                  {isValidCode && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </motion.div>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full gap-2 h-12 md:h-14 text-base"
                  disabled={!isValidCode || joining || !connected}
                  loading={joining}
                  onClick={handleJoin}
                >
                  <LogIn className="w-4 h-4" />
                  {joining ? 'Joining...' : 'Join Room'}
                  <ArrowRight className="w-4 h-4" />
                </Button>

                {!connected && (
                  <p className="text-xs text-muted-foreground text-center">Connecting to server...</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass mb-6 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Swords className="w-5 h-5 text-purple-400" />
                  Quick Join
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full gap-2"
                  loading={joining}
                  disabled={joining || !connected}
                  onClick={handleQuickMatch}
                >
                  <Shuffle className="w-4 h-4" />
                  Quick Match
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  loading={joining}
                  disabled={joining || !connected}
                  onClick={handleRandomRoom}
                >
                  <Search className="w-4 h-4" />
                  Random Room
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <AnimatePresence>
            {recentRooms.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="glass mb-6 border-white/10">
                  <CardHeader className="pb-3 flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <History className="w-5 h-5 text-purple-400" />
                      Recent Rooms
                    </CardTitle>
                    <button
                      onClick={clearRecentRooms}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recentRooms.slice(0, 5).map((room) => {
                      const modeInfo = GAME_MODES.find((m) => m.mode === room.mode);
                      return (
                        <motion.button
                          key={room.code}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          whileHover={{ x: 4 }}
                          onClick={() => joinRoom(room.code)}
                          disabled={joining}
                          className="w-full flex items-center gap-3 p-3 rounded-lg glass glass-hover text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-lg shrink-0">
                            {modeInfo?.icon || '🎵'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm tracking-wider">{room.code}</span>
                              <span className="text-xs text-muted-foreground">{modeInfo?.label || room.mode}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{getTimeAgo(room.timestamp)}</p>
                          </div>
                          <LogIn className="w-4 h-4 text-muted-foreground shrink-0" />
                        </motion.button>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have a code?{' '}
              <Link href="/create-room" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Create a Room
              </Link>
            </p>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
