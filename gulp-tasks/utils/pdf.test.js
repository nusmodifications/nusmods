import fs from 'fs-extra';
import { getPagesFromPdf, getPagesTextFromPdf } from './pdf';

jest.unmock('fs-extra');

/**
 * More files should be included as time passes to maintain compatability
 * with previous years' pdfs.
 */
const fileData = fs.readFileSync('__mocks__/fixtures/test1.pdf');

describe('pdf', () => {
  it('getPagesFromPdf gets pages from pdf', async () => {
    const pages = await getPagesFromPdf(fileData);
    expect(pages.length).toBe(1);
  });

  it('getPagesTextFromPdf gets pages\' text from pdf', async () => {
    const textPages = await getPagesTextFromPdf(fileData);
    expect(textPages.length).toBe(1);
    expect(textPages[0].length).toBe(77);
  });
});
