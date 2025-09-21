const WINDOW = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60) * 1000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 20);

const store = new Map<string, number[]>();

export function checkRateLimit(identifier: string) {
  const now = Date.now();
  const timestamps = store.get(identifier) ?? [];
  const filtered = timestamps.filter((timestamp) => now - timestamp < WINDOW);

  if (filtered.length >= MAX_REQUESTS) {
    return false;
  }

  filtered.push(now);
  store.set(identifier, filtered);
  return true;
}
