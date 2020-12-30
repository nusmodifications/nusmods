import _ from 'lodash';

import { validateExportData } from '../../src/data';
import { makeExportHandler } from '../../src/handler';
import * as render from '../../src/render-serverless';
import type { PageData } from '../../src/types';

type Data = {
  exportData: PageData;
  options: render.ViewportOptions;
};

const handler = makeExportHandler<Data>(
  (request) => {
    const exportData = JSON.parse(request.query.data as never);
    validateExportData(exportData);

    let options: render.ViewportOptions = {
      pixelRatio: _.clamp(Number(request.query.pixelRatio) || 1, 1, 3),
    };
    const height = Number(request.query.height);
    const width = Number(request.query.width);
    if (
      typeof height !== 'undefined' &&
      typeof width !== 'undefined' &&
      !Number.isNaN(height) && // accept floats
      !Number.isNaN(width) && // accept floats
      height > 0 &&
      width > 0
    ) {
      options = { ...options, height, width };
    }

    return {
      exportData,
      options,
    };
  },
  async (response, page, { exportData, options }) => {
    const body = await render.image(page, exportData, options);
    response.setHeader('Content-Disposition', 'attachment; filename="My Timetable.png"');
    response.setHeader('Content-Type', 'image/png');
    response.status(200).send(body);
  },
);

export default handler;
