import { v4 as uuidv4 } from 'uuid';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function calculatePoints(guessTime: number, maxTime: number): number {
  if (guessTime <= 3) return 1000;
  if (guessTime <= 6) return 700;
  if (guessTime <= maxTime) return 500;
  return 0;
}

export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkAnswer(guess: string, correctTitle: string): boolean {
  const normalizedGuess = normalizeString(guess);
  const normalizedTitle = normalizeString(correctTitle);

  if (normalizedGuess === normalizedTitle) return true;

  const guessWords = normalizedGuess.split(' ');
  const titleWords = normalizedTitle.split(' ');

  const matchCount = guessWords.filter(w => titleWords.includes(w)).length;
  return matchCount >= Math.min(guessWords.length, titleWords.length) * 0.7;
}

export function generateSongSearchQuery(category: string, difficulty: string): string {
  const queries: Record<string, Record<string, string>> = {
    pop: {
      easy: 'popular pop songs 2024 2025',
      medium: 'pop hits',
      hard: 'lesser known pop songs',
    },
    rock: {
      easy: 'classic rock hits',
      medium: 'rock songs',
      hard: 'underground rock',
    },
    'hip-hop': {
      easy: 'top hip hop songs',
      medium: 'hip hop hits',
      hard: 'underground hip hop',
    },
    electronic: {
      easy: 'popular electronic music',
      medium: 'electronic dance hits',
      hard: 'deep electronic tracks',
    },
    'r&b': {
      easy: 'popular r&b songs',
      medium: 'r&b hits',
      hard: 'classic r&b',
    },
    country: {
      easy: 'top country songs',
      medium: 'country hits',
      hard: 'country deep cuts',
    },
    indie: {
      easy: 'popular indie songs',
      medium: 'indie hits',
      hard: 'underground indie',
    },
  };

  return queries[category]?.[difficulty] || 'popular music';
}
