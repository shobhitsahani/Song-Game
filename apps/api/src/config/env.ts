import dotenv from 'dotenv';
dotenv.config();

/*
 * Auth env checks commented out — JWT secrets no longer required.
 * Restore when auth backend is re-enabled.
 *
 * const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'FRONTEND_URL'] as const;
 * for (const key of required) {
 *   if (!process.env[key]) { console.error(`Missing required env: ${key}`); process.exit(1); }
 * }
 */

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  /* COMMENTED: DATABASE_URL: process.env.DATABASE_URL!, */
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  /* COMMENTED: JWT_SECRET: process.env.JWT_SECRET!, JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!, */
  JWT_SECRET: process.env.JWT_SECRET || 'disabled',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'disabled',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
} as const;
