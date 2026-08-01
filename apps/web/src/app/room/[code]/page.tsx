'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, LogOut, Play, Users, Settings, WifiOff, Loader2, Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { useSocket } from '@/providers/socket-provider';
import { useGameStore } from '@/stores/game';
import { CountdownOverlay } from '@/components/game/countdown-overlay';
import { GameScreen, type GameStatus } from '@/components/game/game-screen';
import { GameResults } from '@/components/game/game-results';
import type {
  Room, Player, RoomSettings, GameCategory, ChatMessage, RoundPayload, GuessResultPayload, RoundEndPayload, PlayerGuessPayload,
} from '@song-game/types';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = params.code as string;
  const nameParam = searchParams.get('name') || '';
  const { socket, connected, reconnecting } = useSocket();
  const store = useGameStore();

  const MODES: RoomSettings['mode'][] = ['CLASSIC', 'ARTIST', 'ALBUM', 'LYRICS', 'GENRE', 'DECADE', 'HARDCORE', 'SURVIVAL'];
  const ROUND_OPTIONS = [5, 10, 15, 20];
  const GUESS_TIME_OPTIONS = [10, 15, 20, 30];
  const CATEGORIES: { value: GameCategory; label: string }[] = [
    { value: 'any', label: 'Any / Mixed' },
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock' },
    { value: 'hip-hop', label: 'Hip-Hop' },
    { value: 'trending-english', label: 'Trending in English' },
    { value: 'trending-india', label: 'Trending in India' },
    { value: 'hits-2020s', label: '2020s Popular Songs' },
    { value: 'hits-2015', label: '2015 Popular Songs' },
    { value: 'hits-2010-26', label: '2010-26 Popular' },
    { value: 'tiktok', label: 'TikTok Popular Songs' },
  ];

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [countdown, setCountdown] = useState(0);
  const [currentRound, setCurrentRound] = useState<RoundPayload | null>(null);
  const [roundNumber, setRoundNumber] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [revealData, setRevealData] = useState<GuessResultPayload | null>(null);
  const [gamePlayers, setGamePlayers] = useState<Player[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [playerGuesses, setPlayerGuesses] = useState<PlayerGuessPayload[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const localPlayerIdRef = useRef<string | null>(null);
  const codeRef = useRef(codeParam);
  const optionsRef = useRef<string[]>([]);
  codeRef.current = codeParam;

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const resetGameState = useCallback(() => {
    setGameStatus('IDLE');
    setCountdown(0);
    setCurrentRound(null);
    setRoundNumber(0);
    setTotalRounds(0);
    setTimeLeft(0);
    setRevealData(null);
    setGamePlayers([]);
    setOptions([]);
    setSelectedAnswer(null);
    setCorrectIndex(null);
    setPlayerGuesses([]);
    setShowResults(false);
    setIsStarting(false);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onSocketConnect = () => {
      if (codeRef.current) {
        socket.emit('room:join', codeRef.current, {
          username: nameParam || undefined,
          playerId: localPlayerIdRef.current || undefined,
        });
      }
    };
    const onSocketDisconnect = () => {
      resetGameState();
      setRoom(null);
      setPlayers([]);
      setChatMessages([]);
      setLocalPlayerId(null);
      setIsHost(false);
    };

    socket.on('connect', onSocketConnect);
    socket.on('disconnect', onSocketDisconnect);
    if (socket.connected) onSocketConnect();

    return () => {
      socket.off('connect', onSocketConnect);
      socket.off('disconnect', onSocketDisconnect);
    };
  }, [socket, nameParam, resetGameState]);

  useEffect(() => {
    if (!socket || !connected) return;

    const onJoined = (data: Room) => {
      setRoom(data);
      setPlayers(data.players);
      const local = data.players.find((p) => p.socketId === socket.id);
      if (local) {
        localPlayerIdRef.current = local.id;
        setLocalPlayerId(local.id);
        setIsHost(local.isHost);
      }
      store.setRoom(data);
    };

    const onPlayerJoined = (player: Player) => {
      setPlayers((prev) => (prev.some((p) => p.id === player.id) ? prev : [...prev, player]));
    };

    const onPlayerLeft = (playerId: string) => {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      setPlayerGuesses((prev) => prev.filter((g) => g.playerId !== playerId));
    };

    const onPlayerReady = (playerId: string, ready: boolean) => {
      setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, isReady: ready } : p)));
    };

    const onChatMessage = (msg: ChatMessage) => {
      setChatMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    };

    const onChatHistory = (messages: ChatMessage[]) => {
      setChatMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...messages.filter((m) => !seen.has(m.id))];
      });
    };

    const onSettingsUpdated = (settings: RoomSettings) => {
      setRoom((prev) => (prev ? { ...prev, settings } : prev));
    };

    const onHostMigrated = (newHostId: string) => {
      setIsHost(newHostId === localPlayerIdRef.current);
      setPlayers((prev) => prev.map((p) => ({ ...p, isHost: p.id === newHostId })));
    };

    const onGameStart = (data: Room) => {
      setRoom(data);
      setPlayers(data.players);
      store.setRoom(data);
      resetGameState();
      setIsStarting(false);
      setGameStatus('COUNTDOWN');
      setCountdown(3);
    };

    const onCountdown = (seconds: number) => {
      setCountdown(seconds);
      if (seconds > 0) {
        setGameStatus('COUNTDOWN');
      } else {
        setGameStatus('PREVIEW');
      }
    };

    const onRoundStart = (round: RoundPayload) => {
      setCurrentRound(round);
      setRoundNumber(round.roundNumber);
      setTotalRounds(round.totalRounds);
      setOptions(round.options || []);
      setSelectedAnswer(null);
      setCorrectIndex(null);
      setRevealData(null);
      setPlayerGuesses([]);
      setGameStatus('PREVIEW');
      setTimeLeft(0);
    };

    const onAudioPlay = () => {
      setGameStatus('PLAYING');
    };

    const onTimerUpdate = (seconds: number) => {
      setTimeLeft(seconds);
    };

    const onGuessResult = (result: GuessResultPayload) => {
      setRevealData(result);
      setCorrectIndex(result.correctIndex);
      setGameStatus('REVEAL');
      setTimeLeft(0);
    };

    const onPlayerGuess = (data: PlayerGuessPayload) => {
      setPlayerGuesses((prev) =>
        prev.some((g) => g.playerId === data.playerId) ? prev : [...prev, data]
      );
    };

    const onLeaderboard = (updatedPlayers: Player[]) => {
      setGamePlayers(updatedPlayers);
      setPlayers(updatedPlayers);
    };

    const onRoundEnd = (data: RoundEndPayload) => {
      setGamePlayers(data.players);
      setPlayers(data.players);
      const idx = optionsRef.current.indexOf(data.correctAnswer);
      if (idx >= 0) {
        setCorrectIndex(idx);
      }
      setGameStatus('REVEAL');
      setTimeLeft(0);
    };

    const onGameEnd = (results: Player[]) => {
      setGamePlayers(results);
      setPlayers(results);
      setGameStatus('FINISHED');
      setShowResults(true);
    };

    const onKicked = () => {
      toast.error('You have been kicked from the room');
      router.push('/');
    };

    const onError = (msg: string) => {
      setIsStarting(false);
      toast.error(msg);
    };

    socket.on('room:joined', onJoined);
    socket.on('room:player-joined', onPlayerJoined);
    socket.on('room:player-left', onPlayerLeft);
    socket.on('room:player-ready', onPlayerReady);
    socket.on('room:chat-message', onChatMessage);
    socket.on('room:chat-history', onChatHistory);
    socket.on('room:settings-updated', onSettingsUpdated);
    socket.on('room:host-migrated', onHostMigrated);
    socket.on('game:start', onGameStart);
    socket.on('game:countdown', onCountdown);
    socket.on('game:round-start', onRoundStart);
    socket.on('game:audio-play', onAudioPlay);
    socket.on('game:timer-update', onTimerUpdate);
    socket.on('game:guess-result', onGuessResult);
    socket.on('game:player-guess', onPlayerGuess);
    socket.on('game:leaderboard', onLeaderboard);
    socket.on('game:round-end', onRoundEnd);
    socket.on('game:end', onGameEnd);
    socket.on('room:kicked', onKicked);
    socket.on('error', onError);

    return () => {
      socket.off('room:joined', onJoined);
      socket.off('room:player-joined', onPlayerJoined);
      socket.off('room:player-left', onPlayerLeft);
      socket.off('room:player-ready', onPlayerReady);
      socket.off('room:chat-message', onChatMessage);
      socket.off('room:chat-history', onChatHistory);
      socket.off('room:settings-updated', onSettingsUpdated);
      socket.off('room:host-migrated', onHostMigrated);
      socket.off('game:start', onGameStart);
      socket.off('game:countdown', onCountdown);
      socket.off('game:round-start', onRoundStart);
      socket.off('game:audio-play', onAudioPlay);
      socket.off('game:timer-update', onTimerUpdate);
      socket.off('game:guess-result', onGuessResult);
      socket.off('game:player-guess', onPlayerGuess);
      socket.off('game:leaderboard', onLeaderboard);
      socket.off('game:round-end', onRoundEnd);
      socket.off('game:end', onGameEnd);
      socket.off('room:kicked', onKicked);
      socket.off('error', onError);
    };
  }, [socket, connected, router, store, resetGameState, nameParam]);

  const handleLeave = useCallback(() => {
    socket?.emit('room:leave');
    store.reset();
    router.push('/');
  }, [socket, store, router]);

  const handleReady = useCallback(() => {
    socket?.emit('room:ready');
  }, [socket]);

  const handleStart = useCallback(() => {
    if (!room || room.status !== 'WAITING' || isStarting) return;
    setIsStarting(true);
    socket?.emit('game:start');
  }, [socket, room, isStarting]);

  const handleUpdateSettings = useCallback(
    (settings: Partial<RoomSettings>) => {
      socket?.emit('room:update-settings', settings);
    },
    [socket]
  );

  const handleSubmitAnswer = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    socket?.emit('game:guess', answer);
  }, [socket]);

  const handleSendChat = useCallback(() => {
    if (chatInput.trim()) {
      socket?.emit('room:chat', chatInput.trim());
      setChatInput('');
    }
  }, [socket, chatInput]);

  const handleCopyLink = useCallback(() => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    toast.success('Room code copied!');
  }, [room?.code]);

  const activePlayers = players.filter((p) => !p.isSpectator);
  const localPlayer = players.find((p) => p.id === localPlayerId);
  const inGame = gameStatus === 'PREVIEW' || gameStatus === 'PLAYING' || gameStatus === 'REVEAL';

  return (
    <main className="min-h-screen">
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

      <CountdownOverlay countdown={countdown} isActive={gameStatus === 'COUNTDOWN'} />

      <AnimatePresence>
        {showResults && (
          <GameResults
            players={gamePlayers.length > 0 ? gamePlayers : players}
            currentPlayerId={localPlayerId}
            onPlayAgain={resetGameState}
            onBackToLobby={resetGameState}
            onLeave={handleLeave}
          />
        )}
      </AnimatePresence>

      <div className="pt-4 pb-8 px-4 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Room</span>
              <span className="text-lg font-bold ml-1 tracking-wider">{room?.code || codeParam}</span>
            </motion.div>
            <Button variant="ghost" size="icon" onClick={handleCopyLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {gameStatus === 'IDLE' && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" /> {activePlayers.length}
              </Badge>
              {isHost && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                    <Settings className="w-4 h-4 mr-1" /> Settings
                  </Button>
                  <Button
                    onClick={handleStart}
                    className="gap-2"
                    disabled={activePlayers.length < 1 || isStarting}
                  >
                    {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isStarting ? 'Starting...' : 'Start'}
                  </Button>
                </>
              )}
              {!isHost && (
                <Button onClick={handleReady} variant={localPlayer?.isReady ? 'default' : 'outline'}>
                  {localPlayer?.isReady ? 'Ready!' : 'Ready'}
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={handleLeave}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {inGame ? (
          <GameScreen
            mode={room?.mode || room?.settings?.mode || 'CLASSIC'}
            currentRound={currentRound}
            roundNumber={roundNumber || currentRound?.roundNumber || 0}
            totalRounds={totalRounds || currentRound?.totalRounds || 0}
            timeLeft={timeLeft}
            gameStatus={gameStatus}
            revealData={revealData}
            players={gamePlayers.length > 0 ? gamePlayers : players}
            currentPlayerId={localPlayerId}
            options={options}
            selectedAnswer={selectedAnswer}
            correctIndex={correctIndex}
            playerGuesses={playerGuesses}
            onSubmitAnswer={handleSubmitAnswer}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" /> Players ({activePlayers.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activePlayers.map((player) => (
                    <div key={player.id} className="glass rounded-xl p-4 flex items-center gap-3 relative">
                      <Avatar src={player.avatar} alt={player.username} fallback={player.username[0]?.toUpperCase() || '?'} status={player.isReady ? 'online' : 'offline'} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate flex items-center gap-1.5">
                          {player.username}
                          {player.isHost && <Badge variant="premium" size="sm" className="text-[10px]">HOST</Badge>}
                          {player.id === localPlayerId && <span className="text-xs text-muted-foreground">(you)</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {player.isReady ? (
                            <Badge variant="success" size="sm" className="gap-0.5"><Check className="w-2.5 h-2.5" /> Ready</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Waiting...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {activePlayers.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-2 text-center py-8">Waiting for players...</p>
                  )}
                </div>
              </motion.div>

              {showSettings && isHost && room && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">Room Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Mode</label>
                      <select
                        className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm"
                        value={room.settings.mode}
                        onChange={(e) => handleUpdateSettings({ mode: e.target.value as RoomSettings['mode'] })}
                      >
                        {MODES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Rounds</label>
                      <select
                        className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm"
                        value={room.settings.rounds}
                        onChange={(e) => handleUpdateSettings({ rounds: Number(e.target.value) })}
                      >
                        {ROUND_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Guess Time (s)</label>
                      <select
                        className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm"
                        value={room.settings.guessTime}
                        onChange={(e) => handleUpdateSettings({ guessTime: Number(e.target.value) })}
                      >
                        {GUESS_TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
                      <select
                        className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm"
                        value={room.settings.difficulty}
                        onChange={(e) => handleUpdateSettings({ difficulty: e.target.value as RoomSettings['difficulty'] })}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Music Category</label>
                      <select
                        className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm"
                        value={room.settings.category}
                        onChange={(e) => handleUpdateSettings({ category: e.target.value as GameCategory })}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-4 h-full flex flex-col">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Chat</h3>
                <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-80">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="glass rounded-lg p-2.5">
                      <p className="text-xs font-medium text-purple-400">{msg.username}</p>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No messages yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button size="sm" onClick={handleSendChat} disabled={!chatInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
