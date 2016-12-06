import pdfjs from 'pdfjs-dist';
import R from 'ramda';

async function getPagesFromPdf(fileData) {
  const file = new Uint8Array(fileData);
  const pdf = await pdfjs.getDocument(file);
  const pagesRange = R.range(1, pdf.numPages + 1);
  const pages = Promise.all(pagesRange.map(num => pdf.getPage(num)));
  return pages;
}

async function getTextFromPages(pages) {
  function normalizeWords(page) {
    const sentences = [];
    let isPreviousDelimiter = false;
    page.forEach((word) => {
      const isWord = /\w+/.test(word);
      if (isWord && !isPreviousDelimiter && word.length > 1) {
        sentences.push('');
      }
      isPreviousDelimiter = !isWord;
      sentences[sentences.length - 1] += word;
    });
    return sentences;
  }

  const getTextFromPage = R.pipeP(
    page => page.getTextContent(),
    R.prop('items'),
    R.pluck('str'),
    normalizeWords,
  );

  return Promise.all(R.map(getTextFromPage, pages));
}

const getPagesTextFromPdf = R.pipeP(getPagesFromPdf, getTextFromPages);

export { getPagesFromPdf, getPagesTextFromPdf };
