'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import type { Room, GameSettings, GamePlayer, ChatMessage } from '@/types';

interface TypingUser {
  userId: string;
  username: string;
}

export interface JoinRoomOptions {
  username?: string;
  avatar?: string;
}

export function useRoom(socket: Socket | null, roomCode?: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlersRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleJoined = (data: Room) => {
      setRoom(data);
      setPlayers(data.players);
      setSettings(data.settings);
    };

    const handlePlayerJoined = (player: GamePlayer) => {
      setPlayers(prev => {
        if (prev.some(p => p.id === player.id)) return prev;
        return [...prev, player];
      });
    };

    const handlePlayerLeft = (playerId: string) => {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    };

    const handlePlayerReady = (playerId: string, isReady: boolean) => {
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isReady } : p));
    };

    const handleChatMessage = (message: ChatMessage) => {
      setChatMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    const handleChatHistory = (messages: ChatMessage[]) => {
      setChatMessages(prev => {
        const seen = new Set(prev.map(m => m.id));
        const merged = [...prev, ...messages.filter(m => !seen.has(m.id))];
        return merged.length > 30 ? merged.slice(merged.length - 30) : merged;
      });
    };

    const handleSettingsUpdated = (newSettings: GameSettings) => {
      setSettings(newSettings);
    };

    const handleTyping = (data: { userId: string; username: string }) => {
      setTypingUsers(prev => {
        if (prev.some(t => t.userId === data.userId)) return prev;
        return [...prev, data];
      });
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(t => t.userId !== data.userId));
      }, 3000);
    };

    const handleHostMigrated = (newHostId: string) => {
      setPlayers(prev => prev.map(p => ({ ...p, isHost: p.id === newHostId })));
    };

    const handlePasswordRequired = () => {
      setPasswordRequired(true);
    };

    const handleReactionsUpdated = (data: { messageId: string; reactions: { [emoji: string]: string[] } }) => {
      setChatMessages(prev => prev.map(msg =>
        msg.id === data.messageId ? { ...msg, reactions: data.reactions } : msg
      ));
    };

    socket.on('room:joined', handleJoined);
    socket.on('room:player-joined', handlePlayerJoined);
    socket.on('room:player-left', handlePlayerLeft);
    socket.on('room:player-ready', handlePlayerReady);
    socket.on('room:chat-message', handleChatMessage);
    socket.on('room:chat-history', handleChatHistory);
    socket.on('room:settings-updated', handleSettingsUpdated);
    socket.on('room:typing', handleTyping);
    socket.on('room:host-migrated', handleHostMigrated);
    socket.on('room:password-required', handlePasswordRequired);
    socket.on('chat:reactions-updated', handleReactionsUpdated);

    handlersRef.current = () => {
      socket.off('room:joined', handleJoined);
      socket.off('room:player-joined', handlePlayerJoined);
      socket.off('room:player-left', handlePlayerLeft);
      socket.off('room:player-ready', handlePlayerReady);
      socket.off('room:chat-message', handleChatMessage);
      socket.off('room:chat-history', handleChatHistory);
      socket.off('room:settings-updated', handleSettingsUpdated);
      socket.off('room:typing', handleTyping);
      socket.off('room:host-migrated', handleHostMigrated);
      socket.off('room:password-required', handlePasswordRequired);
      socket.off('chat:reactions-updated', handleReactionsUpdated);
    };

    return () => handlersRef.current?.();
  }, [socket]);

  const joinRoom = useCallback((code: string, opts?: JoinRoomOptions) => {
    socket?.emit('room:join', code, opts);
  }, [socket]);

  const leaveRoom = useCallback(() => {
    socket?.emit('room:leave');
    setRoom(null);
    setPlayers([]);
    setChatMessages([]);
    setTypingUsers([]);
  }, [socket]);

  const toggleReady = useCallback(() => {
    socket?.emit('room:ready');
  }, [socket]);

  const sendChat = useCallback((message: string) => {
    socket?.emit('room:chat', message.slice(0, 200));
  }, [socket]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    socket?.emit('room:update-settings', newSettings);
  }, [socket]);

  const emitTyping = useCallback(() => {
    socket?.emit('room:typing');
  }, [socket]);

  const kickPlayer = useCallback((playerId: string) => {
    socket?.emit('room:kick', playerId);
  }, [socket]);

  const banPlayer = useCallback((playerId: string) => {
    socket?.emit('room:ban', playerId);
  }, [socket]);

  const submitPassword = useCallback((password: string) => {
    socket?.emit('room:password', password);
    setPasswordRequired(false);
  }, [socket]);

  return {
    room,
    players,
    chatMessages,
    settings,
    typingUsers,
    passwordRequired,
    joinRoom,
    leaveRoom,
    toggleReady,
    sendChat,
    updateSettings,
    emitTyping,
    kickPlayer,
    banPlayer,
    submitPassword,
    setPasswordRequired,
  };
}
