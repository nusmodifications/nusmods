import { validateExportData } from '../../src/data';
import { makeExportHandler } from '../../src/handler';
import * as render from '../../src/render-serverless';
import type { ExportData } from '../../src/types';

const handler = makeExportHandler<ExportData>(
  (request) => {
    const exportData = JSON.parse(request.query.data as never);
    validateExportData(exportData);
    return exportData;
  },
  async (response, page, exportData) => {
    const body = await render.pdf(page, exportData);
    response.setHeader('Content-Disposition', 'attachment; filename="My Timetable.pdf"');
    response.setHeader('Content-Type', 'application/pdf');
    response.status(200).send(body);
  },
);

export default handler;
