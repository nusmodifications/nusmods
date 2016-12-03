import { getPagesFromPdf, getPagesTextFromPdf } from '../utils/pdf';
import fs from 'fs-promise';

const fileData = fs.readFileSync('__tests__/test.pdf');

describe('pdf', () => {
  it('getPagesFromPdf gets pages from pdf', async () => {
    const pages = await getPagesFromPdf(fileData);
    expect(pages.length).toBe(19);
  });

  it('getPagesTextFromPdf gets pages\' text from pdf', async () => {
    const textPages = await getPagesTextFromPdf(fileData);
    expect(textPages.length).toBe(19);
    expect(textPages[0].length).toBe(1192);
  });
});
