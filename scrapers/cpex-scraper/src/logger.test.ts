import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { createFileLogger } from './logger';

const now = new Date(2026, 2, 4, 5, 6, 7);
const filename = 'cpex-2026-03-04.05-06-07.log';

let tempDir: string;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpex-logger-test-'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('creates the logs directory and flushes timestamped console output to disk', async () => {
  const logDir = path.join(tempDir, 'logs');
  const logger = createFileLogger(now, logDir);
  logger.log('Scraping', 42, 'modules');
  logger.log('Done!');
  await logger.close();

  const lines = vi.mocked(console.log).mock.calls.map(([line]) => line);
  expect(lines[0]).toMatch(/^\[\d{4}-\d{2}-\d{2}T[^\]]+\] Scraping 42 modules$/);
  expect(lines[1]).toMatch(/\] Done!$/);
  expect(fs.readFileSync(path.join(logDir, filename), 'utf8')).toBe(`${lines.join('\n')}\n`);
});

test('appends when a log file already exists', async () => {
  const logPath = path.join(tempDir, filename);
  fs.writeFileSync(logPath, 'Previous run\n');
  const logger = createFileLogger(now, tempDir);
  logger.log('Next run');
  await logger.close();

  expect(fs.readFileSync(logPath, 'utf8')).toBe(
    `Previous run\n${vi.mocked(console.log).mock.calls[0][0]}\n`,
  );
});

test.each([false, true])(
  'rejects close after a write error (already failed: %s)',
  async (alreadyFailed) => {
    // A directory at the log path makes opening the real write stream fail.
    fs.mkdirSync(path.join(tempDir, filename));
    const logger = createFileLogger(now, tempDir);
    logger.log('Before failure');
    if (alreadyFailed) {
      await vi.waitFor(() => expect(console.error).toHaveBeenCalledOnce());
      logger.log('Still visible on stdout');
      expect(console.log).toHaveBeenLastCalledWith(
        expect.stringContaining('Still visible on stdout'),
      );
    }
    await expect(logger.close()).rejects.toThrow();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[FileLogger] write stream error:'),
    );
  },
);
