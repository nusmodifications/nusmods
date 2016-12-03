import pdfjs from 'pdfjs-dist';
import R from 'ramda';

async function getPagesFromPdf(fileData) {
  const file = new Uint8Array(fileData);
  const pdf = await pdfjs.getDocument(file);
  const pagesRange = R.range(1, pdf.numPages + 1);
  const pages = Promise.all(pagesRange.map(num => pdf.getPage(num)));
  return pages;
}

const getTextFromPage = R.pipeP(R.invoker(0, 'getTextContent'), R.prop('items'), R.pluck('str'));

async function getTextFromPages(pages) {
  return Promise.all(R.map(getTextFromPage, pages));
}

const getPagesTextFromPdf = R.pipeP(getPagesFromPdf, getTextFromPages);

export { getPagesFromPdf, getPagesTextFromPdf };
