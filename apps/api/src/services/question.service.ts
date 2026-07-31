import { getRandomSongs, type SongData } from './song.service.js';
import type { GameMode } from '@song-game/types';

export interface QuestionData {
  roundNumber: number;
  song: SongData;
  correctAnswer: string;
  options: string[];
  correctIndex: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const FALLBACK_ANSWERS: Record<string, string[]> = {
  title: [
    'Blinding Lights', 'Shape of You', 'Levitating', 'As It Was', 'Good 4 U',
    'Stay', 'Heat Waves', 'Save Your Tears', 'Industry Baby', 'Peaches',
    'Montero', 'Kiss Me More', 'Bad Habits', 'Shivers', 'Easy On Me',
    'Happier Than Ever', 'All Too Well', 'Don’t Start Now', 'Watermelon Sugar',
    'Circles',
  ],
  album: [
    'Future Nostalgia', 'After Hours', 'Fine Line', 'Anti', 'Lemonade',
    'Happier Than Ever', 'Sour', 'Justice', 'Positions', 'Folklore',
    'Certified Lover Boy', 'DAMN.', 'Divide', 'Dua Lipa', 'Future Nostalgia',
    'Renaissance', 'Midnights', '30', 'Chemistry', 'Un Verano Sin Ti',
  ],
  artist: [
    'Drake', 'Taylor Swift', 'Ed Sheeran', 'Beyonce', 'The Weeknd',
    'Adele', 'Post Malone', 'Billie Eilish', 'Dua Lipa', 'Kendrick Lamar',
    'Bad Bunny', 'Doja Cat', 'Harry Styles', 'Olivia Rodrigo', 'Lil Nas X',
    'Bruno Mars', 'Ariana Grande', 'Justin Bieber', 'Rihanna', 'Travis Scott',
  ],
};

export function answerFieldForMode(mode: GameMode): 'title' | 'album' | 'artist' {
  if (mode === 'CLASSIC' || mode === 'LYRICS') return 'title';
  if (mode === 'ALBUM') return 'album';
  return 'artist';
}

export async function generateQuestions(
  category: string,
  totalRounds: number,
  mode: GameMode
): Promise<QuestionData[]> {
  const songs = await getRandomSongs(category, totalRounds);

  if (songs.length === 0) {
    throw new Error('No songs available. Check Deezer API connection.');
  }

  const answerField = answerFieldForMode(mode);
  const allAnswers = songs.map((s) => s[answerField]);
  const uniqueAnswers = [...new Set(allAnswers)];
  const fallbacks = FALLBACK_ANSWERS[answerField] || FALLBACK_ANSWERS.artist;

  const questions: QuestionData[] = [];
  const usedAnswers = new Set<string>();

  for (let i = 0; i < songs.length && questions.length < totalRounds; i++) {
    const song = songs[i];
    const correctAnswer = song[answerField];
    const answerKey = correctAnswer.toLowerCase();

    if (usedAnswers.has(answerKey)) continue;
    usedAnswers.add(answerKey);

    const wrongAnswers = uniqueAnswers.filter(
      (a) => a.toLowerCase() !== correctAnswer.toLowerCase()
    );

    let optionsWrong = shuffleArray(wrongAnswers).slice(0, 3);

    if (optionsWrong.length < 3) {
      const extraWrong = fallbacks.filter(
        (a) => a.toLowerCase() !== correctAnswer.toLowerCase() && !optionsWrong.includes(a)
      );
      while (optionsWrong.length < 3 && extraWrong.length > 0) {
        optionsWrong.push(extraWrong.shift()!);
      }
    }

    const allOptions = shuffleArray([correctAnswer, ...optionsWrong]);
    const correctIndex = allOptions.indexOf(correctAnswer);

    questions.push({
      roundNumber: i + 1,
      song,
      correctAnswer,
      options: allOptions,
      correctIndex,
    });
  }

  return questions;
}
