import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  DEEZER_APP_ID: string;
  DEEZER_APP_SECRET: string;
  DEEZER_REDIRECT_URI: string;
  YOUTUBE_API_KEY: string;
  FRONTEND_URL: string;
}

const requiredVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'DEEZER_APP_ID',
  'DEEZER_APP_SECRET',
  'DEEZER_REDIRECT_URI',
  'FRONTEND_URL',
];

const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(
    `[Env] Missing required environment variables:\n  ${missingVars.join('\n  ')}\n` +
      'See SETUP.md for configuration instructions.',
  );
  process.exit(1);
}

function parseNumber(val: string | undefined, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export const env: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseNumber(process.env.PORT, 4000),
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  DEEZER_APP_ID: process.env.DEEZER_APP_ID!,
  DEEZER_APP_SECRET: process.env.DEEZER_APP_SECRET!,
  DEEZER_REDIRECT_URI: process.env.DEEZER_REDIRECT_URI!,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
  FRONTEND_URL: process.env.FRONTEND_URL!,
};
