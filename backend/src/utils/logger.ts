const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const base = JSON.stringify({
    timestamp,
    level,
    message,
    ...(meta ? { meta } : {}),
    pid: process.pid,
  });
  if (level === 'error' || level === 'warn') {
    return base;
  }
  if (currentLevel === 'debug') {
    const colorMap: Record<LogLevel, string> = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' };
    return `${colorMap[level]}[${level.toUpperCase()}]\x1b[0m ${timestamp} ${message}`;
  }
  return `[${level.toUpperCase()}] ${message}`;
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('debug')) console.debug(formatMessage('debug', message, meta));
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('info')) console.log(formatMessage('info', message, meta));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, meta));
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('error')) console.error(formatMessage('error', message, meta));
  },
};
