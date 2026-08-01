'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, LogOut, Play, Users, Settings, Eye, WifiOff, Loader2, KeyRound, UserPlus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import { GameModeBadge } from '@/components/shared/game-mode-badge';
import { CountdownOverlay } from '@/components/game/CountdownOverlay';
import { useSocketContext } from '@/providers/SocketProvider';
import { useRoom } from '@/hooks/useRoom';
import { useGame } from '@/hooks/useGame';
import { useUser } from '@/providers/UserProvider';
import { useAuthStore } from '@/store/auth';
import { useGameStore } from '@/store/game';
import { useFriendStore as useFriendsStore } from '@/store/friends';
import { LobbyScreen } from '@/components/lobby/lobby-screen';
import { GameMode, GameSettings } from '@/types';

const GameScreen = dynamic(() => import('@/components/game/game-screen').then(m => ({ default: m.GameScreen })), { ssr: false });
const GameResults = dynamic(() => import('@/components/game/game-results').then(m => ({ default: m.GameResults })), { ssr: false });

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const { socket, connected, reconnecting } = useSocketContext();
  const { user } = useUser();
  const authUser = useAuthStore((s) => s.user);
  const { setGame, setRound, addPlayer, removePlayer, updatePlayer, reset: resetGameStore } = useGameStore();
  const { room, players, chatMessages, settings, typingUsers, passwordRequired, joinRoom, leaveRoom, toggleReady, sendChat, updateSettings, emitTyping, kickPlayer, banPlayer, submitPassword, setPasswordRequired } = useRoom(socket);
  const {
    gameStatus, countdown, currentRound, players: gamePlayers, timeLeft,
    revealData, previewUrl, roundNumber, totalRounds, options, selectedAnswer,
    correctIndex, startGame, submitAnswer, resetGame,
  } = useGame(socket);
  const { friends } = useFriendsStore();

  const [showSettings, setShowSettings] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const effectiveUser = user || authUser;
  const mode: GameMode = (searchParams.get('mode') as GameMode) || room?.mode || room?.settings?.mode || 'CLASSIC';

  const createdRef = useRef(false);

  const initialSettings = useMemo(() => {
    if (code !== 'CREATE') return null;
    const newSettings: Partial<GameSettings> = {};
    const rounds = searchParams.get('rounds');
    const guessTime = searchParams.get('guessTime');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const modeParam = searchParams.get('mode') as GameMode | null;
    const maxPlayers = searchParams.get('maxPlayers');
    const allowSpectators = searchParams.get('allowSpectators');
    const password = searchParams.get('password');

    if (modeParam) newSettings.mode = modeParam;
    if (rounds) newSettings.rounds = parseInt(rounds);
    if (guessTime) newSettings.guessTime = parseInt(guessTime);
    if (category) newSettings.category = category;
    if (difficulty) newSettings.difficulty = difficulty;
    if (maxPlayers) newSettings.maxPlayers = parseInt(maxPlayers);
    if (allowSpectators) newSettings.allowSpectators = allowSpectators === 'true';
    if (password) newSettings.isPrivate = true;

    return Object.keys(newSettings).length > 0 ? newSettings : null;
  }, []);

  useEffect(() => {
    if (!socket || !connected) return;
    if (code === 'CREATE') {
      if (createdRef.current) return;
      createdRef.current = true;
      joinRoom('CREATE');
    } else if (code?.length === 6) {
      joinRoom(code);
    }
  }, [socket, connected, code, joinRoom]);

  useEffect(() => {
    if (room && code === 'CREATE' && room.code !== 'CREATE') {
      router.replace(`/room/${room.code}`);
    }
  }, [room, code, router]);

  const settingsAppliedRef = useRef(false);
  useEffect(() => {
    if (room && code === 'CREATE' && initialSettings && !settingsAppliedRef.current) {
      settingsAppliedRef.current = true;
      setTimeout(() => updateSettings(initialSettings), 500);
    }
  }, [room, code, initialSettings, updateSettings]);

  useEffect(() => {
    if (gameStatus === 'FINISHED') {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (room) setGame(room);
  }, [room, setGame]);

  useEffect(() => {
    if (currentRound) setRound(currentRound);
  }, [currentRound, setRound]);

  useEffect(() => {
    if (gamePlayers.length > 0) {
      gamePlayers.forEach((p) => updatePlayer(p));
    }
  }, [gamePlayers, updatePlayer]);

  const isHost = room?.host?.id === effectiveUser?.id || players.find((p) => p.id === effectiveUser?.id)?.isHost;
  const spectators = players.filter((p) => p.isSpectator);
  const activePlayers = players.filter((p) => !p.isSpectator);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Room link copied!');
  }, []);

  const handlePlayAgain = useCallback(() => {
    resetGame();
    resetGameStore();
    router.push('/create-room');
  }, [router, resetGame, resetGameStore]);

  const handleBackToLobby = useCallback(() => {
    resetGame();
    setShowResults(false);
  }, [resetGame]);

  const handleLeave = useCallback(() => {
    leaveRoom();
    resetGame();
    resetGameStore();
    router.push('/');
  }, [leaveRoom, resetGame, resetGameStore, router]);

  const handlePasswordSubmit = useCallback(() => {
    if (passwordInput.trim()) {
      submitPassword(passwordInput.trim());
      setPasswordInput('');
    }
  }, [passwordInput, submitPassword]);

  const handleStartGame = useCallback(() => {
    if (activePlayers.length < 1) {
      toast.error('Need at least 1 player to start');
      return;
    }
    startGame();
  }, [startGame, activePlayers.length]);

  const roomSettings = settings || room?.settings || null;

  return (
    <main className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {!connected && !reconnecting && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-red-500/90 backdrop-blur-sm py-2 px-4 text-center">
          <p className="text-sm font-medium text-white flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" /> Connection lost. Attempting to reconnect...
          </p>
        </div>
      )}
      {reconnecting && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-yellow-500/90 backdrop-blur-sm py-2 px-4 text-center">
          <p className="text-sm font-medium text-white flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Reconnecting...
          </p>
        </div>
      )}

      <Dialog open={passwordRequired} onOpenChange={() => setPasswordRequired(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-400" />
              Room Password Required
            </DialogTitle>
            <DialogDescription>This room is private. Enter the password to join.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input type="password" placeholder="Enter room password..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} autoFocus />
            <Button onClick={handlePasswordSubmit} disabled={!passwordInput.trim()}>Join</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Friends</DialogTitle>
            <DialogDescription>Invite friends to join your room</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No friends to invite</p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                        {friend.avatar || friend.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{friend.username}</p>
                        <p className={`text-xs ${friend.isOnline ? 'text-green-400' : 'text-muted-foreground'}`}>
                          {friend.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedFriends.includes(friend.id) ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedFriends((prev) =>
                          prev.includes(friend.id)
                            ? prev.filter((id) => id !== friend.id)
                            : [...prev, friend.id]
                        );
                      }}
                    >
                      {selectedFriends.includes(friend.id) ? 'Selected' : 'Invite'}
                    </Button>
                  </div>
                ))
              )}
            </div>
            <Button
              className="w-full gap-2"
              disabled={selectedFriends.length === 0}
              onClick={() => {
                selectedFriends.forEach((friendId) => {
                  socket?.emit('room:join', room?.code || '');
                });
                toast.success(`${selectedFriends.length} friend(s) invited`);
                setSelectedFriends([]);
                setShowInvite(false);
              }}
            >
              <Send className="w-4 h-4" /> Send Invites
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CountdownOverlay countdown={countdown} isActive={gameStatus === 'COUNTDOWN'} />

      <AnimatePresence>
        {showResults && (
          <GameResults
            players={gamePlayers.length > 0 ? gamePlayers : players}
            currentUserId={effectiveUser?.id}
            onPlayAgain={handlePlayAgain}
            onBackToLobby={handleBackToLobby}
            onLeave={handleLeave}
          />
        )}
      </AnimatePresence>

      {!showResults && (
        <div className="pt-4 pb-8 px-4 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-lg px-4 py-2 flex items-center gap-2">
                <GameModeBadge mode={mode} size="sm" />
                <span className="text-sm text-muted-foreground">Room</span>
                <span className="text-lg font-bold ml-1 tracking-wider">{room?.code || code}</span>
              </motion.div>
              <Button variant="ghost" size="icon" onClick={handleCopyLink} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {(gameStatus === 'IDLE') && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" />
                  {activePlayers.length}
                  {spectators.length > 0 && (
                    <span className="text-muted-foreground ml-1">
                      <Eye className="w-3 h-3 inline ml-1" /> {spectators.length}
                    </span>
                  )}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                  <Settings className="w-4 h-4 mr-1" /> Settings
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowInvite(true)}>
                  <UserPlus className="w-4 h-4 mr-1" /> Invite
                </Button>
                {isHost ? (
                  <Button onClick={handleStartGame} className="gap-2" disabled={activePlayers.length < 1}>
                    <Play className="w-4 h-4" /> Start Game
                  </Button>
                ) : (
                  <Button onClick={toggleReady} variant={players.find((p) => p.id === effectiveUser?.id)?.isReady ? 'default' : 'outline'}>
                    {players.find((p) => p.id === effectiveUser?.id)?.isReady ? 'Ready!' : 'Mark Ready'}
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={handleLeave}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {(gameStatus === 'PREVIEW' || gameStatus === 'PLAYING' || gameStatus === 'REVEAL') ? (
            <GameScreen
              mode={mode}
              currentRound={currentRound}
              roundNumber={roundNumber || currentRound?.roundNumber || 0}
              totalRounds={totalRounds || currentRound?.totalRounds || 0}
              timeLeft={timeLeft}
              gameStatus={gameStatus}
              revealData={revealData}
              players={gamePlayers.length > 0 ? gamePlayers : players}
              currentUserId={effectiveUser?.id}
              settings={roomSettings}
              options={options}
              selectedAnswer={selectedAnswer}
              correctIndex={correctIndex}
              previewUrl={previewUrl}
              onSubmitAnswer={submitAnswer}
            />
          ) : (
            <LobbyScreen
              room={room}
              players={players}
              settings={roomSettings}
              chatMessages={chatMessages}
              typingUsers={typingUsers}
              isHost={!!isHost}
              currentUserId={effectiveUser?.id}
              showSettings={showSettings}
              onToggleReady={toggleReady}
              onStartGame={handleStartGame}
              onSendChat={sendChat}
              onTyping={emitTyping}
              onUpdateSettings={updateSettings}
              onKickPlayer={kickPlayer}
              onBanPlayer={banPlayer}
              onCopyInvite={handleCopyLink}
              onToggleSettings={() => setShowSettings(!showSettings)}
            />
          )}
        </div>
      )}
    </main>
  );
}
