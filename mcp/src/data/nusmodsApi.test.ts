import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Module } from '../types/modules.js';
import { clearCache } from './cache.js';
import { fetchModule, ModuleNotFoundError } from './nusmodsApi.js';

function stubFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const mock = vi.fn(async () => response as Response);
  vi.stubGlobal('fetch', mock);
  return mock;
}

const sampleModule = { moduleCode: 'CS2030S', title: 'Programming Methodology II' } as Module;

describe('fetchModule', () => {
  beforeEach(() => {
    clearCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the correct URL with an upper-cased code and dashed academic year', async () => {
    const mock = stubFetch({ ok: true, status: 200, json: async () => sampleModule });

    await fetchModule('cs2030s', '2024/2025');

    expect(mock).toHaveBeenCalledOnce();
    expect(mock).toHaveBeenCalledWith('https://api.nusmods.com/v2/2024-2025/modules/CS2030S.json');
  });

  it('returns the parsed module', async () => {
    stubFetch({ ok: true, status: 200, json: async () => sampleModule });

    const module = await fetchModule('CS9999X', '2024/2025');

    expect(module.moduleCode).toBe('CS2030S');
  });

  it('throws ModuleNotFoundError on 404', async () => {
    stubFetch({ ok: false, status: 404, statusText: 'Not Found' });

    await expect(fetchModule('BOGUS404', '2024/2025')).rejects.toBeInstanceOf(ModuleNotFoundError);
  });

  it('throws a generic error on other non-ok responses', async () => {
    stubFetch({ ok: false, status: 500, statusText: 'Server Error' });

    await expect(fetchModule('BOOM500', '2024/2025')).rejects.toThrow(/500 Server Error/);
  });
});
