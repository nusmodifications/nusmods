import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import puppeteer, { TimeoutError } from 'puppeteer-core';
import type { Page } from 'puppeteer-core';

import type { CourseRegRound } from './types';

const REPORTS = {
  vacancy: 'VacancyRpt',
  ug: 'DemandAllocationRptUG',
  gd: 'DemandAllocationRptGD',
};

const DOWNLOAD_TIMEOUT = 15_000;
export const MAX_PDF_BYTES = 16 * 1024 * 1024;

async function downloadPdf(page: Page, url: string, file: string) {
  const deadline = Date.now() + DOWNLOAD_TIMEOUT;
  try {
    await page.goto(url, { timeout: DOWNLOAD_TIMEOUT, waitUntil: 'domcontentloaded' });
  } catch (error) {
    // Chrome aborts document navigation when it hands the response to its download manager.
    const startedDownload = error instanceof Error && error.message.includes('net::ERR_ABORTED');
    if (!startedDownload && !(error instanceof TimeoutError)) {
      throw error;
    }
  }

  do {
    try {
      if ((await stat(file)).size > MAX_PDF_BYTES) {
        console.warn(JSON.stringify({ url, warning: 'CourseReg PDF exceeds the size limit' }));
        return undefined;
      }
      const pdf = await readFile(file);
      return pdf.subarray(0, 5).toString() === '%PDF-' ? pdf : undefined;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
    await delay(250);
  } while (Date.now() < deadline);
  return undefined;
}

export async function downloadCurrentPdfs(
  temporaryDir: string,
  pdfDir: string,
  rounds: ReadonlyArray<CourseRegRound>,
) {
  const downloadDir = path.join(temporaryDir, 'downloads');
  const profileDir = path.join(temporaryDir, 'chrome');
  await mkdir(downloadDir);
  await mkdir(path.join(profileDir, 'Default'), { recursive: true });
  await writeFile(
    path.join(profileDir, 'Default', 'Preferences'),
    JSON.stringify({ plugins: { always_open_pdf_externally: true } }),
  );

  const executablePath = process.env.CHROME_EXECUTABLE_PATH;
  const browser = await puppeteer.launch({
    ...(executablePath ? { executablePath } : { channel: 'chrome' }),
    headless: true,
    pipe: true,
    userDataDir: profileDir,
  });

  try {
    const session = await browser.target().createCDPSession();
    const canceledDownloads = new Set<string>();
    session.on('Browser.downloadProgress', ({ guid, state, receivedBytes, totalBytes }) => {
      if (
        state !== 'inProgress' ||
        Math.max(receivedBytes, totalBytes) <= MAX_PDF_BYTES ||
        canceledDownloads.has(guid)
      ) {
        return;
      }
      canceledDownloads.add(guid);
      console.warn(
        JSON.stringify({
          receivedBytes,
          totalBytes,
          warning: 'CourseReg download exceeds the size limit',
        }),
      );
      void session.send('Browser.cancelDownload', { guid }).catch(() => {
        // The download may have finished before Chrome received the cancellation.
      });
    });
    await session.send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir,
      eventsEnabled: true,
    });

    for (const round of rounds) {
      for (const [reportType, report] of Object.entries(REPORTS)) {
        const filename = `${report}_R${round}.pdf`;
        const url = `https://www.nus.edu.sg/coursereg/docs/${filename}`;
        const page = await browser.newPage();
        try {
          const pdf = await downloadPdf(page, url, path.join(downloadDir, filename));
          if (pdf) {
            const reportDir = path.join(pdfDir, reportType);
            await mkdir(reportDir, { recursive: true });
            await writeFile(path.join(reportDir, `round_${round}.pdf`), pdf);
          } else {
            console.warn(JSON.stringify({ url, warning: 'CourseReg PDF download unavailable' }));
          }
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
}
