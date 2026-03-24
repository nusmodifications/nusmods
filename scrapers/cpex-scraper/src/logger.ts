import fs from 'node:fs';
import path from 'node:path';

const LOG_DIR = path.join(__dirname, '../logs');

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatTimestamp(date: Date): string {
  return (
    date.getFullYear().toString() +
    '-' +
    pad2(date.getMonth() + 1) +
    '-' +
    pad2(date.getDate()) +
    '.' +
    pad2(date.getHours()) +
    '-' +
    pad2(date.getMinutes()) +
    '-' +
    pad2(date.getSeconds())
  );
}

export type FileLogger = Pick<Console, 'log'> & {
  close: () => void;
};

/**
 * Creates a logger that writes timestamped lines to both stdout and a log file.
 * The log file is written to `scrapers/cpex-scraper/logs/cpex-YYYY-MM-DD.HH-mm-ss.log`.
 *
 * Satisfies the `Pick<Console, 'log'>` interface used by the CPEx scraper.
 */
export function createFileLogger(now: Date = new Date()): FileLogger {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  const filename = `cpex-${formatTimestamp(now)}.log`;
  const logPath = path.join(LOG_DIR, filename);
  const stream = fs.createWriteStream(logPath, { flags: 'a' });

  function log(...args: Array<unknown>): void {
    const timestamp = new Date().toISOString();
    const message = args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ');
    const line = `[${timestamp}] ${message}`;

    console.log(line);
    stream.write(`${line}\n`);
  }

  function close(): void {
    stream.end();
  }

  return { close, log };
}
