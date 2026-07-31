/*
 * Auth middleware commented out — requires JWT secrets + env.
 * Restore when backend infrastructure is set up.
 *
 * import jwt from 'jsonwebtoken';
 * import { env } from '../config/env.js';
 * import type { JWTPayload } from '@song-game/types';
 */

import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/*
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;
  if (!token) { res.status(401).json({ success: false, error: 'Authentication required' }); return; }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    if (payload.type !== 'access') { res.status(401).json({ success: false, error: 'Invalid token type' }); return; }
    req.userId = payload.userId;
    next();
  } catch { res.status(401).json({ success: false, error: 'Invalid or expired token' }); }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      if (payload.type === 'access') { req.userId = payload.userId; }
    } catch { /* Ignore invalid tokens * / }
  }
  next();
}
*/

/* Auth bypass — no JWT verification needed */
export function authenticate(_req: Request, _res: Response, next: NextFunction): void {
  next();
}

export function optionalAuth(_req: Request, _res: Response, next: NextFunction): void {
  next();
}
