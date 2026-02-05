import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  });
}

export async function withTelegramLock<T>(fn: () => Promise<T>): Promise<T> {
  // No Redis configured — run without lock
  if (!redis) {
    return await fn();
  }

  const lockKey = 'cherkoe:telegram:lock';
  const lockValue = Date.now().toString();
  const lockTTL = 60;

  let acquired = false;

  for (let i = 0; i < 30; i++) {
    const result = await redis.set(lockKey, lockValue, { nx: true, ex: lockTTL });

    if (result === 'OK') {
      acquired = true;
      break;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  if (!acquired) {
    throw new Error('Could not acquire Telegram lock');
  }

  try {
    return await fn();
  } finally {
    const currentValue = await redis.get(lockKey);
    if (String(currentValue) === String(lockValue)) {
      await redis.del(lockKey);
    }
  }
}
