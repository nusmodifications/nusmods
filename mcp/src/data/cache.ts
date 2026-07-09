import config from '../config.js';

/**
 * Tiny in-memory TTL cache with in-flight de-duplication.
 *
 * Scoped to a single warm process/serverless instance — good enough to shield
 * the CDN from repeated identical fetches within an invocation's lifetime.
 * There is no eviction beyond TTL expiry; the keyspace (module JSON URLs) is
 * bounded and small.
 */
type Entry<T> = { expires: number; value: T };

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export async function getCached<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs: number = config.cacheTtlMs,
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) {
    return hit.value as T;
  }

  const pending = inflight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = (async () => {
    try {
      const value = await loader();
      store.set(key, { expires: Date.now() + ttlMs, value });
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise as Promise<T>;
}
