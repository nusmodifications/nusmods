import pdfjs from 'pdfjs-dist';
import R from 'ramda';

async function getPagesFromPdf(fileData) {
  const file = new Uint8Array(fileData);
  const pdf = await pdfjs.getDocument(file);
  const pagesRange = R.range(1, pdf.numPages + 1);
  const pages = Promise.all(pagesRange.map((num) => pdf.getPage(num)));
  return pages;
}

async function getTextFromPages(pages) {
  function joinStrings(arrayOfObj) {
    let yPos = arrayOfObj[0].width;
    return arrayOfObj.reduce((str, obj) => {
      const previousYPos = yPos;
      yPos = obj.transform[4] - obj.width;

      // don't add space if they're too close
      const separator = yPos - previousYPos <= 0 ? '' : ' ';
      return str + separator + obj.str;
    }, '');
  }

  const getTextFromPage = R.pipeP(
    (page) => page.getTextContent(),
    R.prop('items'),
    R.groupWith((a, b) => a.transform[5] === b.transform[5]),
    R.map(joinStrings),
  );

  return Promise.all(R.map(getTextFromPage, pages));
}

const getPagesTextFromPdf = R.pipeP(getPagesFromPdf, getTextFromPages);

export { getPagesFromPdf, getPagesTextFromPdf };
