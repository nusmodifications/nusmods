import { validateExportData } from '../../src/data';
import { makeExportHandler } from '../../src/handler';
import { renderPdf } from '../../src/render-pdf';
import type { ExportData } from '../../src/types';

const handler = makeExportHandler<ExportData>(
  (request) => {
    const exportData = JSON.parse(request.query.data as never);
    validateExportData(exportData);
    return exportData;
  },
  async (response, exportData) => {
    const body = await renderPdf(exportData);
    response.setHeader('Content-Disposition', 'attachment; filename="My Timetable.pdf"');
    response.setHeader('Content-Type', 'application/pdf');
    response.status(200).send(body);
  },
);

export default handler;
