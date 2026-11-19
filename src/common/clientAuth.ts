import { timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { notifyError, toKyivDate } from './utils';

// Each var holds one client's key, all with equal access. One var per client, so a key can be revoked on its own.
const CLIENT_KEY_ENV_VARS = ['CLIENT_AUTH_KEY', 'ZORESLAV_AUTH_KEY'];

const matchesKey = (received: Buffer, envVar: string): boolean => {
  const expected = Buffer.from(process.env[envVar] || '');
  // timingSafeEqual throws on different lengths, so check that first
  return expected.length > 0 && received.length === expected.length && timingSafeEqual(received, expected);
};

/** Rejects requests whose `x-api-key` header doesn't match any of CLIENT_KEY_ENV_VARS.
 * Fails closed: unset vars match nothing, so with none set every request is rejected. */
export function requireClientAuthKey(req: Request, res: Response, next: NextFunction) {
  const received = Buffer.from(req.get('x-api-key') || '');
  const isValid = CLIENT_KEY_ENV_VARS.some((envVar) => matchesKey(received, envVar));

  if (!isValid) {
    const alert = recordAuthFailure(req);
    const reply = () => {
      res.status(401).json({ error: 'unauthorized' });
    };
    // Serverless (Vercel) may freeze the function right after the response, so the request
    // that triggers the alert answers only once it's sent (notifyError never rejects, 10s timeout).
    if (alert) alert.then(reply).catch((e) => console.error('auth: failed to reply 401', e));
    else reply();
    return;
  }
  next();
}

// --- 401 alert: the 11th failure within 3h of the first one sends one Telegram summary, then mute until the window ends ---

const AUTH_WINDOW_MS = 3 * 60 * 60 * 1000;
const AUTH_ALERT_THRESHOLD = 10; // alert when failures in a window are MORE than this

interface ICallerStats {
  count: number;
  keyState: Set<'missing' | 'wrong'>; // never the received key itself, it may be a mistyped real one
  userAgents: Set<string>;
  paths: Set<string>;
  times: number[];
}

// ponytail: in-memory, so on serverless each instance counts on its own and a cold start resets it;
// move to a shared store (e.g. Redis) if alerts get missed
const authFailures = new Map<string, ICallerStats>();
let windowStart = 0;
let mutedInWindow = false;

// ponytail: x-forwarded-for can be spoofed; fine for stats, never use it for blocking
const callerIp = (req: Request): string =>
  req.get('x-forwarded-for')?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';

const formatTime = (ms: number) => toKyivDate(ms).format('DD.MM HH:mm:ss');

const formatCaller = (ip: string, s: ICallerStats): string =>
  [
    `${ip} — ${s.count} req, key: ${[...s.keyState].join('/')}`,
    `UA: ${[...s.userAgents].join(' | ')}`,
    `paths: ${[...s.paths].join(', ')}`,
    `times: ${s.times.map(formatTime).join(', ')}`,
  ].join('\n');

export function resetAuthFailures(): void {
  authFailures.clear();
  windowStart = 0;
  mutedInWindow = false;
}

/** Records a rejected request; returns the alert promise when this failure crossed the threshold. */
export function recordAuthFailure(req: Request): Promise<void> | undefined {
  try {
    const now = Date.now();
    if (now - windowStart > AUTH_WINDOW_MS) resetAuthFailures();
    if (mutedInWindow) return;
    if (!authFailures.size) windowStart = now;

    const ip = callerIp(req);
    const stats = authFailures.get(ip) ?? { count: 0, keyState: new Set(), userAgents: new Set(), paths: new Set(), times: [] };
    stats.count++;
    stats.keyState.add(req.get('x-api-key') ? 'wrong' : 'missing');
    stats.userAgents.add((req.get('user-agent') || '-').slice(0, 150));
    stats.paths.add(`${req.method} ${(req.originalUrl || req.url || '').slice(0, 100)}`);
    stats.times.push(now);
    authFailures.set(ip, stats);

    const callers = [...authFailures.entries()].sort(([, a], [, b]) => b.count - a.count);
    const total = callers.reduce((sum, [, s]) => sum + s.count, 0);
    if (total <= AUTH_ALERT_THRESHOLD) return;

    // At most THRESHOLD + 1 requests are ever stored, so the message stays well under Telegram's 4096 chars
    const header =
      `auth: ${total} unauthorized requests since ${formatTime(windowStart)}, ${callers.length} callers. ` +
      `Muted until ${formatTime(windowStart + AUTH_WINDOW_MS)}`;
    const body = callers.map(([ip, s]) => formatCaller(ip, s)).join('\n\n');
    mutedInWindow = true;
    authFailures.clear();
    return notifyError(header, body, 3800);
  } catch (e) {
    console.error('recordAuthFailure failed', e); // stats bug must never turn a 401 into a 500
    return;
  }
}
