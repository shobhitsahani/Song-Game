'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, Clock, X, Ban, Eye, Copy, Shield, Users, Sparkles, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { Separator } from '@/components/ui/separator';
import { RoomSettingsPanel } from '@/components/lobby/room-settings';
import { ChatPanel } from '@/components/lobby/chat-panel';
import { GameModeBadge } from '@/components/shared/game-mode-badge';
import { Room, GameSettings, GamePlayer, ChatMessage, GAME_MODES } from '@/types';

interface TypingUser { userId: string; username: string; }

interface LobbyScreenProps {
  room: Room | null;
  players: GamePlayer[];
  settings: GameSettings | null;
  chatMessages: ChatMessage[];
  typingUsers: TypingUser[];
  isHost: boolean;
  currentUserId?: string;
  showSettings: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
  onSendChat: (message: string) => void;
  onTyping: () => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onKickPlayer: (playerId: string) => void;
  onBanPlayer: (playerId: string) => void;
  onCopyInvite: () => void;
  onToggleSettings: () => void;
}

function MusicNoteParticle({ index }: { index: number }) {
  const notes = ['♪', '♫', '♩', '♬'];
  const note = notes[index % notes.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 10;
  const duration = 8 + Math.random() * 12;
  const size = 12 + Math.random() * 16;

  return (
    <motion.div
      className="absolute text-violet-400/10 pointer-events-none select-none"
      style={{ left: `${left}%`, fontSize: size, top: -30 }}
      initial={{ y: -30, opacity: 0, rotate: 0 }}
      animate={{ y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800, opacity: [0, 0.4, 0], rotate: 360 }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    >
      {note}
    </motion.div>
  );
}

export function LobbyScreen({
  room, players, settings, chatMessages, typingUsers, isHost, currentUserId,
  showSettings, onToggleReady, onStartGame, onSendChat, onTyping, onReaction, onUpdateSettings,
  onKickPlayer, onBanPlayer, onCopyInvite, onToggleSettings,
}: LobbyScreenProps) {
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  const activePlayers = useMemo(() => players.filter((p) => !p.isSpectator), [players]);
  const spectators = useMemo(() => players.filter((p) => p.isSpectator), [players]);
  const isReady = useMemo(() => players.find((p) => p.id === currentUserId)?.isReady ?? false, [players, currentUserId]);
  const allReady = useMemo(() => activePlayers.length > 0 && activePlayers.every((p) => p.isReady), [activePlayers]);

  const mode = room?.mode || settings?.mode || 'CLASSIC';

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      toast.success('Room code copied!');
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <MusicNoteParticle key={i} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold/5 to-transparent rounded-full -mr-20 -mt-20" />

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Room Code</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold tracking-[0.3em] text-gradient">{room?.code || '------'}</span>
                  <button onClick={handleCopyCode} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GameModeBadge mode={mode} />
                <Badge variant={room?.settings?.isPrivate ? 'warning' : 'success'} className="gap-1">
                  {room?.settings?.isPrivate ? 'Private' : 'Public'}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" /> {activePlayers.length}/{room?.maxPlayers || settings?.maxPlayers || 8}
                </Badge>
              </div>
            </div>

            {room?.settings?.isPrivate && (
              <Badge variant="outline" className="mt-2 text-xs text-muted-foreground gap-1">
                <Shield className="w-3 h-3" /> Password protected
              </Badge>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold">Players ({activePlayers.length})</h2>
                {spectators.length > 0 && (
                  <Badge variant="secondary" size="sm">
                    <Eye className="w-3 h-3 mr-1" /> {spectators.length} spectating
                  </Badge>
                )}
              </div>
              {isHost && activePlayers.length >= 1 && (
                <Badge variant={allReady ? 'success' : 'secondary'} className="gap-1">
                  <Check className="w-3 h-3" /> {allReady ? 'All Ready' : `${activePlayers.filter((p) => p.isReady).length}/${activePlayers.length} Ready`}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {activePlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                    onHoverStart={() => setHoveredPlayer(player.id)}
                    onHoverEnd={() => setHoveredPlayer(null)}
                    className="glass rounded-xl p-3 flex items-center gap-3 glass-hover relative group"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-10 h-10 ring-2 ring-gold/25">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-gold to-ember text-white text-sm">
                          {player.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {player.isHost && (
                        <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 rounded-full p-0.5 shadow-lg">
                          <Crown className="w-3 h-3 text-yellow-900" />
                        </div>
                      )}
                      {player.isSpectator && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 shadow-lg">
                          <Eye className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {player.username}
                        </p>
                        {player.id === currentUserId && (
                          <Badge variant="premium" size="sm" className="text-[10px]">You</Badge>
                        )}
                        {player.isHost && (
                          <Badge variant="warning" size="sm" className="text-[10px]">Host</Badge>
                        )}
                      </div>
                      {player.isReady && (
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready
                        </p>
                      )}
                    </div>

                    <AnimatePresence>
                      {player.isReady ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Badge variant="success" className="gap-1 shrink-0">
                            <Check className="w-3 h-3" /> Ready
                          </Badge>
                        </motion.div>
                      ) : (
                        <Badge variant="secondary" className="gap-1 shrink-0">
                          <Clock className="w-3 h-3" /> Waiting
                        </Badge>
                      )}
                    </AnimatePresence>

                    {isHost && player.id !== currentUserId && (
                      <AnimatePresence>
                        {hoveredPlayer === player.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-1"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => onKickPlayer(player.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => onBanPlayer(player.id)}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {activePlayers.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No players in the room yet</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Share the room code to invite friends</p>
                </motion.div>
              )}
            </div>

            {spectators.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Spectators ({spectators.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {spectators.map((s) => (
                    <div key={s.id} className="flex items-center gap-1.5 bg-secondary/30 rounded-full px-2.5 py-1">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={s.avatar} />
                        <AvatarFallback className="text-[8px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                          {s.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{s.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Button variant="glass" className="gap-2" onClick={onCopyInvite}>
              <Copy className="w-4 h-4" /> Invite Friends
            </Button>
            {!isHost && (
              <Button variant={isReady ? 'default' : 'outline'} onClick={onToggleReady} className="gap-2 relative overflow-hidden">
                {isReady ? (
                  <>
                    <Check className="w-4 h-4" /> Ready!
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Mark Ready</>
                )}
              </Button>
            )}
            {isHost && (
              <Button
                onClick={onStartGame}
                className="gap-2 bg-gradient-to-r from-gold to-ember hover:brightness-110 shadow-lg shadow-gold/25"
                disabled={activePlayers.length < 1}
              >
                <Play className="w-4 h-4" /> Start Game
              </Button>
            )}
          </motion.div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {showSettings && settings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <RoomSettingsPanel
                  settings={settings}
                  onUpdate={onUpdateSettings}
                  isHost={isHost}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="h-[400px] lg:h-[calc(100vh-280px)]"
          >
            <ChatPanel
              messages={chatMessages}
              onSend={onSendChat}
              onTyping={onTyping}
              onReaction={onReaction}
              typingUsers={typingUsers}
              currentUserId={currentUserId}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
