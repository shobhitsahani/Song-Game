export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkAnswer(guess: string, correct: string): boolean {
  const nGuess = normalizeString(guess);
  const nCorrect = normalizeString(correct);
  if (nGuess === nCorrect) return true;
  const guessWords = nGuess.split(' ');
  const correctWords = nCorrect.split(' ');
  const matches = guessWords.filter((w) => correctWords.includes(w)).length;
  return matches >= Math.min(guessWords.length, correctWords.length) * 0.7;
}

export function calculatePoints(guessTime: number, maxTime: number): number {
  if (guessTime <= 3) return 1000;
  if (guessTime <= 6) return 700;
  if (guessTime <= maxTime) return 500;
  return 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function getLevel(xp: number): number {
  const thresholds = [
    0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
    5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000,
    21000, 23100, 25300, 27600, 30000, 32500, 35100, 37800, 40600, 43500,
    46500, 49600, 52800, 56100, 59500, 63000, 66600, 70300, 74100, 78000,
    82000, 86100, 90300, 94600, 99000, 103500, 108100, 112800, 117600, 122500,
  ];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}

export function getLevelProgress(xp: number): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
  const thresholds = [
    0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
    5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000,
    21000, 23100, 25300, 27600, 30000, 32500, 35100, 37800, 40600, 43500,
    46500, 49600, 52800, 56100, 59500, 63000, 66600, 70300, 74100, 78000,
    82000, 86100, 90300, 94600, 99000, 103500, 108100, 112800, 117600, 122500,
  ];
  const level = getLevel(xp);
  const currentThreshold = thresholds[Math.max(0, level - 1)];
  const nextThreshold = thresholds[Math.min(level, thresholds.length - 1)];
  return {
    level,
    currentXP: xp - currentThreshold,
    nextLevelXP: nextThreshold - currentThreshold,
    progress: (xp - currentThreshold) / (nextThreshold - currentThreshold),
  };
}

export const XP_REWARDS = {
  WIN_GAME: 500,
  SECOND_PLACE: 300,
  THIRD_PLACE: 100,
  CORRECT_GUESS: 50,
  FAST_GUESS_BONUS: 100,
  PERFECT_GAME: 200,
  DAILY_LOGIN: 50,
  COMPLETE_CHALLENGE: 150,
} as const;
