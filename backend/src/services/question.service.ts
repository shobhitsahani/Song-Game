import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { getRandomSongs, SongData } from './song.service';

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

export async function generateQuestions(
  prisma: PrismaClient,
  redis: Redis | null,
  category: string,
  totalRounds: number
): Promise<QuestionData[]> {
  const songs = await getRandomSongs(prisma, redis, category, totalRounds);

  if (songs.length === 0) {
    throw new Error('No songs available. Check Deezer API connection.');
  }

  const allArtists = songs.map((s) => s.artist);
  const uniqueArtists = [...new Set(allArtists)];

  const questions: QuestionData[] = [];

  for (let i = 0; i < songs.length && i < totalRounds; i++) {
    const song = songs[i];
    const correctAnswer = song.artist;

    const wrongAnswers = uniqueArtists.filter(
      (a) => a.toLowerCase() !== correctAnswer.toLowerCase()
    );

    let optionsWrong = shuffleArray(wrongAnswers).slice(0, 3);

    if (optionsWrong.length < 3) {
      const extra = ['Drake', 'Taylor Swift', 'Ed Sheeran', 'Beyonce', 'The Weeknd',
        'Adele', 'Post Malone', 'Billie Eilish', 'Dua Lipa', 'Kendrick Lamar',
        'Bad Bunny', 'Doja Cat', 'Harry Styles', 'Olivia Rodrigo', 'Lil Nas X'];
      const extraWrong = extra.filter(
        (a) => a.toLowerCase() !== correctAnswer.toLowerCase() &&
               !optionsWrong.includes(a)
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

export function getSongOptions(
  songs: SongData[],
  currentIndex: number
): { options: string[]; correctIndex: number; correctAnswer: string } {
  const currentSong = songs[currentIndex];
  const correctAnswer = currentSong.artist;

  const otherArtists = songs
    .filter((_, i) => i !== currentIndex)
    .map((s) => s.artist);

  const uniqueOthers = [...new Set(otherArtists)];
  const shuffledOthers = shuffleArray(uniqueOthers).slice(0, 3);

  const allOptions = shuffleArray([correctAnswer, ...shuffledOthers]);
  const correctIndex = allOptions.indexOf(correctAnswer);

  return { options: allOptions, correctIndex, correctAnswer };
}
