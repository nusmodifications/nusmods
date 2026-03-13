import { validateExportData } from '../../src/data';
import { makeExportHandler } from '../../src/handler';
import { parseViewportOptions } from '../../src/image-options';
import { renderImage } from '../../src/render-image';
import type { ExportData } from '../../src/types';

type Data = {
  exportData: ExportData;
  options: import('../../src/types').ViewportOptions;
};

const handler = makeExportHandler<Data>(
  (request) => {
    const exportData = JSON.parse(request.query.data as never);
    validateExportData(exportData);

    return {
      exportData,
      options: parseViewportOptions(request.query),
    };
  },
  async (response, { exportData, options }) => {
    const body = await renderImage(exportData, options);
    response.setHeader('Content-Disposition', 'attachment; filename="My Timetable.png"');
    response.setHeader('Content-Type', 'image/png');
    response.status(200).send(body);
  },
);

export default handler;
