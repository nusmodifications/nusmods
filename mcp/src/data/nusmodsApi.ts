import config, { toUrlAcadYear } from '../config.js';
import type { Module } from '../types/modules.js';
import { getCached } from './cache.js';

function v2BaseUrl(acadYear: string): string {
  return `${config.apiBaseUrl}/v2/${toUrlAcadYear(acadYear)}`;
}

/** Thrown when a module code has no data for the requested academic year. */
export class ModuleNotFoundError extends Error {
  constructor(
    public readonly moduleCode: string,
    public readonly acadYear: string,
  ) {
    super(`No module "${moduleCode}" found for academic year ${acadYear}.`);
    this.name = 'ModuleNotFoundError';
  }
}

/**
 * Fetch full details for a single module from the public v2 JSON API.
 * Results are cached in-process (module JSON is static CDN content).
 */
export async function fetchModule(
  moduleCode: string,
  acadYear: string = config.academicYear,
): Promise<Module> {
  const code = moduleCode.trim().toUpperCase();
  const url = `${v2BaseUrl(acadYear)}/modules/${code}.json`;

  return getCached(url, async () => {
    const response = await fetch(url);
    if (response.status === 404) {
      throw new ModuleNotFoundError(code, acadYear);
    }
    if (!response.ok) {
      throw new Error(
        `Failed to fetch module ${code} (${response.status} ${response.statusText}).`,
      );
    }
    return (await response.json()) as Module;
  });
}
