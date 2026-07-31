import { create } from 'zustand';

interface GameState {
  game: any | null; players: any[]; round: any | null; isPlaying: boolean;
  setGame: (game: any) => void; setRound: (round: any) => void;
  addPlayer: (p: any) => void; removePlayer: (id: string) => void;
  updatePlayer: (p: any) => void; reset: () => void; setReady: (ready: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  game: null, players: [], round: null, isPlaying: false,
  setGame: (game) => set({ game, isPlaying: game?.status === 'PLAYING' }),
  setRound: (round) => set({ round }),
  addPlayer: (p) => set((s) => ({ players: [...s.players.filter(x => x.id !== p.id), p] })),
  removePlayer: (id) => set((s) => ({ players: s.players.filter(p => p.id !== id) })),
  updatePlayer: (p) => set((s) => ({ players: s.players.map(x => x.id === p.id ? { ...x, ...p } : x) })),
  reset: () => set({ game: null, players: [], round: null, isPlaying: false }),
  setReady: (ready) => set((s) => ({ players: s.players.map(p => ({ ...p, isReady: ready })) })),
}));