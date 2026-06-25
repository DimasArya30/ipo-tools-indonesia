const PREFIX = 'ipohub_cache_';

export const getCache = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { data, ts, ttl } = JSON.parse(raw);
    if (Date.now() - ts > ttl) return null;
    return data as T;
  } catch { return null; }
};

export const setCache = <T>(key: string, data: T, ttlMs: number): void => {
  localStorage.setItem(PREFIX + key, JSON.stringify({ data, ts: Date.now(), ttl: ttlMs }));
};

export const invalidateCache = (key: string): void => {
  localStorage.removeItem(PREFIX + key);
};