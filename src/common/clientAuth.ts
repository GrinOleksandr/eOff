import { timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';

/** Rejects requests whose `x-api-key` header doesn't match CLIENT_AUTH_KEY.
 * Fails closed: if CLIENT_AUTH_KEY is unset, every request is rejected. */
export function requireClientAuthKey(req: Request, res: Response, next: NextFunction) {
  const expected = Buffer.from(process.env.CLIENT_AUTH_KEY || '');
  const received = Buffer.from(req.get('x-api-key') || '');

  // timingSafeEqual throws on different lengths, so check that first
  const isValid = expected.length > 0 && received.length === expected.length && timingSafeEqual(received, expected);

  if (!isValid) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
}
