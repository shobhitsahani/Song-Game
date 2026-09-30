'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn, ArrowRight, ArrowLeft, Swords, Shuffle, Clock,
  Hash, History, X, Search, Users, AudioLines, Sparkles,
  DoorOpen, TriangleAlert, CircleCheckBig, User
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { PlayerProfileForm } from '@/components/join/PlayerProfileForm';
import { RoomModeSwitch } from '@/components/shared/RoomModeSwitch';
import { loadRoomJoinProfile, saveRoomJoinProfile } from '@/lib/avatars';
import { GAME_MODES } from '@/types';
import { Logo } from '@/components/shared/Logo';

const RECENT_ROOMS_KEY = 'sg-recent-rooms';

interface RecentRoom {
  code: string;
  mode: string;
  timestamp: number;
}

type PendingAction =
  | { type: 'code'; code: string }
  | { type: 'recent'; code: string }
  | { type: 'quick' }
  | { type: 'random' };

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
  const [step, setStep] = useState<'code' | 'profile'>('code');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
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

  const joinRoom = useCallback((roomCode: string, opts?: { username?: string; avatar?: string }, roomPassword?: string) => {
    if (!socket || !connected) { setError('Not connected to server. Please try again.'); return; }
    if (roomCode.length !== 6) { setError('Room code must be 6 characters.'); return; }

    setJoining(true);
    setError(null);

    socket.emit('room:join', roomCode, opts);

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

  const beginJoin = useCallback((action: PendingAction) => {
    if (!socket || !connected) { setError('Not connected to server. Please try again.'); return; }
    const saved = loadRoomJoinProfile();
    setProfileName(saved?.name || user?.username || '');
    setProfileAvatar(saved?.avatar || user?.avatar || '');
    setPendingAction(action);
    setStep('profile');
    setError(null);
  }, [socket, connected, user]);

  const handleQuickMatchWith = useCallback((name: string, avatar: string) => {
    if (!socket || !connected) { setError('Not connected to server.'); return; }
    setJoining(true);
    setError(null);

    socket.emit('room:quick-match', { username: name, avatar });

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

  const handleRandomRoomWith = useCallback((name: string, avatar: string) => {
    if (!socket || !connected) { setError('Not connected to server.'); return; }
    setJoining(true);
    setError(null);

    socket.emit('room:random', { username: name, avatar });

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

  const handleProfileSubmit = useCallback((name: string, avatar: string) => {
    saveRoomJoinProfile({ name, avatar });
    if (!pendingAction) return;
    switch (pendingAction.type) {
      case 'code':
      case 'recent':
        joinRoom(pendingAction.code, { username: name, avatar });
        break;
      case 'quick':
        handleQuickMatchWith(name, avatar);
        break;
      case 'random':
        handleRandomRoomWith(name, avatar);
        break;
    }
  }, [pendingAction, joinRoom, handleQuickMatchWith, handleRandomRoomWith]);

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
          <AudioLines className="w-8 h-8 text-gold drop-shadow-[0_0_14px_rgba(168,85,247,0.5)]" />
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Stage-light ambience */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-[44rem] h-[44rem] rounded-full bg-gold/15 blur-[130px] animate-float-slow" />
        <div className="absolute top-1/2 -left-44 w-96 h-96 rounded-full bg-ember/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 w-[30rem] h-[30rem] rounded-full bg-mint/10 blur-[120px] animate-float-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(247,168,58,0.10),transparent_62%)]" />
      </div>

      <div className="relative z-10 pt-10 pb-16 px-4 max-w-5xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
            <Logo />
            <Button variant="ghost" size="sm" className="-mr-2 hover:text-gold" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8 flex justify-center">
            <RoomModeSwitch active="join" />
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-ember opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
                </span>
                Song Game · Live Lobby
              </span>
            </div>

            <div aria-hidden className="eq mx-auto mb-6" style={{ height: 32 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="eq-bar animate-eq"
                  style={{ height: `${52 + (i % 3) * 16}%`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>

            <h1 className="font-display text-4xl md:text-[2.75rem] leading-tight font-bold mb-3 tracking-wide">
              {step === 'profile' ? (
                <span className="text-gradient-primary">Your Stage Name</span>
              ) : (
                <>Join the <span className="text-gradient-primary">Room</span></>
              )}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {step === 'profile'
                ? 'Pick the name and avatar your crew will see when you step on stage.'
                : 'Drop a 6-character room code, jump into quick match, or spin for a random room.'}
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/40 text-destructive text-sm text-center flex items-center justify-center gap-2"
            >
              <TriangleAlert className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:items-start">
          <AnimatePresence mode="wait">
            {step === 'profile' ? (
              <motion.div
                key="profile"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                className="lg:col-span-5"
              >
                <Card className="liquid mb-6 border-white/10 max-w-2xl mx-auto">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-display uppercase tracking-[0.15em]">
                      <User className="w-5 h-5 text-gold" />
                      Your Identity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PlayerProfileForm
                      initialName={profileName}
                      initialAvatar={profileAvatar}
                      accountAvatar={user?.avatar}
                      submitting={joining}
                      submitLabel={joining ? 'Joining…' : 'Join Room'}
                      onSubmit={handleProfileSubmit}
                    />
                    <Button
                      variant="ghost"
                      className="w-full mt-3"
                      disabled={joining}
                      onClick={() => { setStep('code'); setError(null); }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back to room code
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="code" initial="hidden" animate="visible" variants={containerVariants} className="lg:col-span-5 lg:grid lg:grid-cols-5 lg:gap-6 lg:items-start">
                <div className="lg:col-span-3 min-w-0">
                <motion.div variants={itemVariants}>
            <Card className="liquid mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-display uppercase tracking-[0.15em]">
                  <DoorOpen className="w-5 h-5 text-gold" />
                  Enter Room Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary/40 border border-white/5">
                    <div className="relative">
                      <Avatar src={user.avatar} alt={user.username} fallback={user.username?.[0] ?? '?'} className="w-9 h-9" />
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-mint ring-2 ring-background" aria-hidden />
                    </div>
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
                    placeholder="ABC 123"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && isValidCode && beginJoin({ type: 'code', code })}
                    maxLength={6}
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className={`w-full text-center font-mono text-2xl md:text-3xl font-semibold tracking-[0.45em] h-14 md:h-16 rounded-xl border bg-secondary/50 backdrop-blur-xl px-3 py-2 ring-offset-background transition-all duration-300 placeholder:text-muted-foreground/30 placeholder:tracking-[0.25em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isValidCode
                        ? 'border-gold/70 ring-2 ring-gold/40 shadow-lg shadow-gold/20'
                        : code.length > 0
                          ? 'border-destructive/60'
                          : 'border-border'
                    }`}
                    aria-label="Room code"
                  />
                  {isValidCode && (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CircleCheckBig className="w-6 h-6 text-mint drop-shadow-[0_0_8px_rgba(53,167,124,0.6)]" />
                      </motion.div>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-2 right-4 px-1.5 rounded bg-background text-[10px] font-semibold uppercase tracking-[0.2em] text-mint"
                      >
                        Ready
                      </motion.span>
                    </>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full gap-2 h-12 md:h-14 text-base"
                  disabled={!isValidCode || joining || !connected}
                  onClick={() => beginJoin({ type: 'code', code })}
                >
                  <LogIn className="w-4 h-4" />
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>

                {!connected && (
                  <p className="text-xs text-muted-foreground text-center">Connecting to server...</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="liquid mb-6 liquid-hover">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-display uppercase tracking-[0.15em]">
                  <Swords className="w-5 h-5 text-ember" />
                  Fast Track
                </CardTitle>
                <p className="text-xs text-muted-foreground">Skip the code — get matched right now</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="gradient"
                  size="lg"
                  className="liquid-btn w-full gap-2"
                  disabled={joining || !connected}
                  onClick={() => beginJoin({ type: 'quick' })}
                >
                  <Shuffle className="w-4 h-4" />
                  Quick Match
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 border-mint/40 text-mint hover:bg-mint/10 hover:text-mint hover:border-mint/60"
                  disabled={joining || !connected}
                  onClick={() => beginJoin({ type: 'random' })}
                >
                  <Search className="w-4 h-4" />
                  Random Room
                </Button>
              </CardContent>
            </Card>
          </motion.div>
                </div>

                <div className="lg:col-span-2 lg:sticky lg:top-8 self-start min-w-0">
                <motion.div variants={itemVariants} className="mb-6">
                  <Card className="liquid overflow-hidden border-gold/25">
                    <span aria-hidden className="liquid-shine" />
                    <CardContent className="p-5">
                      <p className="font-display text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                        Hosting tonight?
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                        Skip the code — spin up your own room and deal your friends in.
                      </p>
                      <Link href="/create-room" className="block">
                        <Button variant="gradient" size="lg" fullWidth className="liquid-btn group">
                          <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
                          Start a Room
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>

                <AnimatePresence>
                {recentRooms.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="liquid mb-6">
                  <CardHeader className="pb-3 flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-display uppercase tracking-[0.15em]">
                      <History className="w-5 h-5 text-mint" />
                      On Repeat
                    </CardTitle>
                    <button
                      onClick={clearRecentRooms}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {recentRooms.slice(0, 5).map((room, index) => {
                      const modeInfo = GAME_MODES.find((m) => m.mode === room.mode);
                      return (
                        <motion.button
                          key={room.code}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => beginJoin({ type: 'recent', code: room.code })}
                          disabled={joining}
                          className="group w-full flex items-center gap-3 p-3 rounded-xl text-left border border-transparent hover:border-white/10 hover:bg-white/[0.05] transition-colors"
                        >
                          <span className="w-6 text-center font-mono text-xs text-muted-foreground/60 group-hover:text-gold transition-colors">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center text-base shrink-0 group-hover:bg-gold/20 transition-colors">
                            {modeInfo?.icon || '🎵'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-sm tracking-wider">{room.code}</span>
                              <span className="text-xs text-muted-foreground">{modeInfo?.label || room.mode}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{getTimeAgo(room.timestamp)}</p>
                          </div>
                          <LogIn className="w-4 h-4 text-gold shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </motion.button>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
                )}
                </AnimatePresence>

                <p className="text-center text-xs text-muted-foreground/70 pt-1">
                  Codes are 6 characters — share yours with the crew.
                </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
