import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCached } from './cache.js';

describe('getCached', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the loaded value and caches it for subsequent calls', async () => {
    const loader = vi.fn(async () => 'value');

    const first = await getCached('key-caches', loader);
    const second = await getCached('key-caches', loader);

    expect(first).toBe('value');
    expect(second).toBe('value');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('de-duplicates concurrent in-flight calls for the same key', async () => {
    const loader = vi.fn(async () => 'shared');

    const [a, b] = await Promise.all([
      getCached('key-inflight', loader),
      getCached('key-inflight', loader),
    ]);

    expect(a).toBe('shared');
    expect(b).toBe('shared');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('reloads after the TTL expires', async () => {
    const loader = vi.fn(async () => 'fresh');

    await getCached('key-ttl', loader, 1000);
    vi.advanceTimersByTime(1001);
    await getCached('key-ttl', loader, 1000);

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('caches different keys independently', async () => {
    const loader = vi.fn(async (): Promise<string> => 'x');

    await getCached('key-a', loader);
    await getCached('key-b', loader);

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('does not cache a rejected loader (retries on next call)', async () => {
    const loader = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('recovered');

    await expect(getCached('key-reject', loader)).rejects.toThrow('boom');
    await expect(getCached('key-reject', loader)).resolves.toBe('recovered');
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
