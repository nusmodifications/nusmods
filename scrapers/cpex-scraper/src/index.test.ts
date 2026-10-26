import fs from 'node:fs';

import { createFileLogger } from './logger';
import { scrapeCPEx } from './scraper';

vi.mock('./logger', () => ({ createFileLogger: vi.fn() }));
vi.mock('./scraper', () => ({ scrapeCPEx: vi.fn() }));

const originalExitCode = process.exitCode;

beforeEach(() => {
  vi.resetModules();
  process.exitCode = 0;
  vi.spyOn(fs, 'readFileSync').mockReturnValue('{}');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  process.exitCode = originalExitCode;
  vi.restoreAllMocks();
  vi.resetAllMocks();
});

test.each([
  { scrapeFails: false, closeFails: false },
  { scrapeFails: true, closeFails: false },
  { scrapeFails: false, closeFails: true },
  { scrapeFails: true, closeFails: true },
])('handles scrape/close outcomes: %j', async ({ scrapeFails, closeFails }) => {
  const scrapeError = new Error('scrape failed');
  const closeError = new Error('disk full');
  const logger = { close: vi.fn(), log: vi.fn() };
  vi.mocked(createFileLogger).mockReturnValue(logger);
  vi.mocked(scrapeCPEx).mockImplementation(async () => {
    if (scrapeFails) {
      throw scrapeError;
    }
    return {
      modules: [],
      archiveFilename: '',
      wroteCurrentFile: false,
      summary: { totalRawRows: 0, skippedIncomplete: 0, unknownMpeValues: 0, duplicatesMerged: 0 },
    };
  });
  logger.close.mockImplementation(async () => {
    if (closeFails) {
      throw closeError;
    }
  });

  await import('./index');
  await vi.waitFor(() => {
    expect(logger.close).toHaveBeenCalledOnce();
    expect(process.exitCode).toBe(scrapeFails || closeFails ? 1 : 0);
    if (closeFails) {
      expect(console.error).toHaveBeenCalledWith(`Failed to write scrape log: ${closeError}`);
    }
  });
  expect(scrapeCPEx).toHaveBeenCalledWith(expect.objectContaining({ logger }));
  expect(logger.log.mock.calls).toEqual(scrapeFails ? [[`Failed to scrape: ${scrapeError}`]] : []);
  expect(console.error).toHaveBeenCalledTimes(closeFails ? 1 : 0);
});
