import { create } from 'zustand';
import type { Room, Player, Round, ChatMessage } from '@song-game/types';

interface GameState {
  room: Room | null;
  players: Player[];
  round: Round | null;
  isPlaying: boolean;
  gameStatus: 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'REVEAL' | 'FINISHED';
  chatMessages: ChatMessage[];
  setRoom: (room: Room) => void;
  setPlayers: (players: Player[]) => void;
  setRound: (round: Round) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (player: Partial<Player> & { id: string }) => void;
  setGameStatus: (status: 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'REVEAL' | 'FINISHED') => void;
  addChatMessage: (msg: ChatMessage) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  room: null,
  players: [],
  round: null,
  isPlaying: false,
  gameStatus: 'IDLE',
  chatMessages: [],

  setRoom: (room) => set({ room, isPlaying: room.status === 'PLAYING' }),
  setPlayers: (players) => set({ players }),
  setRound: (round) => set({ round }),
  addPlayer: (player) =>
    set((state) => ({
      players: state.players.some((p) => p.id === player.id) ? state.players : [...state.players, player],
    })),
  removePlayer: (id) =>
    set((state) => ({ players: state.players.filter((p) => p.id !== id) })),
  updatePlayer: (player) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === player.id ? { ...p, ...player } : p)),
    })),
  setGameStatus: (status) => set({ gameStatus: status }),
  addChatMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  reset: () =>
    set({
      room: null,
      players: [],
      round: null,
      isPlaying: false,
      gameStatus: 'IDLE',
      chatMessages: [],
    }),
}));
