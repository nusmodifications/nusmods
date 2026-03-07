import { Resvg } from '@resvg/resvg-js';
import PDFDocument from 'pdfkit';

import { getModules } from './data';
import { renderSatoriSvg } from './satori/render-satori';
import type { ExportData } from './types';

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const PAGE_MARGIN_PT = 24;
const PAGE_MARGIN_VERTICAL_X_PT = 10;
const PDF_IMAGE_SCALE = 2;

export async function renderPdf(exportData: ExportData): Promise<Buffer> {
  const startedAt = Date.now();
  const modules = await getModules(Object.keys(exportData.timetable));
  const modulesLoadedAt = Date.now();

  const isLandscape = exportData.theme.timetableOrientation === 'HORIZONTAL';
  const pageWidth = isLandscape ? A4_HEIGHT_PT : A4_WIDTH_PT;
  const pageHeight = isLandscape ? A4_WIDTH_PT : A4_HEIGHT_PT;

  const { svg, layout } = await renderSatoriSvg(exportData, modules);

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: PDF_IMAGE_SCALE },
  });
  const pngBuffer = resvg.render().asPng();

  const marginX = isLandscape ? PAGE_MARGIN_PT : PAGE_MARGIN_VERTICAL_X_PT;
  const marginY = PAGE_MARGIN_PT;
  const availableWidth = pageWidth - marginX * 2;
  const availableHeight = pageHeight - marginY * 2;
  const scale = Math.min(availableWidth / layout.width, availableHeight / layout.height);
  const fitWidth = layout.width * scale;
  const fitHeight = layout.height * scale;
  const x = (pageWidth - fitWidth) / 2;
  const y = isLandscape ? (pageHeight - fitHeight) / 2 : marginY;

  const doc = new PDFDocument({
    autoFirstPage: true,
    layout: isLandscape ? 'landscape' : 'portrait',
    margin: 0,
    size: 'A4',
  });

  doc.image(pngBuffer, x, y, { width: fitWidth, height: fitHeight });
  doc.end();

  const chunks: Buffer[] = [];
  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const renderFinishedAt = Date.now();
  console.info(
    JSON.stringify({
      durationMs: renderFinishedAt - startedAt,
      moduleCount: modules.length,
      moduleLoadMs: modulesLoadedAt - startedAt,
      renderMs: renderFinishedAt - modulesLoadedAt,
      renderer: 'satori-pdf',
      type: 'export-pdf',
    }),
  );

  return pdfBuffer;
}
