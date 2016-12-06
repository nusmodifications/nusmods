import fs from 'fs-promise';
import { getPagesFromPdf, getPagesTextFromPdf } from '../gulp-tasks/utils/pdf';

/**
 * More files should be included as time passes to maintain compatability
 * with previous years' pdfs.
 */
const fileData = fs.readFileSync('__tests__/test-files/test.pdf');

describe('pdf', () => {
  it('getPagesFromPdf gets pages from pdf', async () => {
    const pages = await getPagesFromPdf(fileData);
    expect(pages.length).toBe(1);
  });

  it('getPagesTextFromPdf gets pages\' text from pdf', async () => {
    const textPages = await getPagesTextFromPdf(fileData);
    expect(textPages.length).toBe(1);
    expect(textPages[0].length).toBe(271);
  });
});
