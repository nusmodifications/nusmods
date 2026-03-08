import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

import config from '../config';
import type { ExportData, Module, ViewportOptions } from '../types';
import { getSatoriFonts } from './fonts';
import { buildRenderableTimetable } from './render-model';
import {
  estimateImageLayout,
  estimateVerticalImageLayout,
  TimetableImage,
  type TimetableImageLayout,
} from './view';

export async function renderSatoriSvg(
  exportData: ExportData,
  modules: Module[],
  options: ViewportOptions = {},
): Promise<{ svg: string; layout: TimetableImageLayout }> {
  const width = options.width || config.pageWidth;
  const model = buildRenderableTimetable(exportData, modules);
  const layout = model.isVertical
    ? estimateVerticalImageLayout(model, width, options.height)
    : estimateImageLayout(model, width, options.height);
  const fonts = await getSatoriFonts();

  const svg = await satori(<TimetableImage layout={layout} model={model} />, {
    fonts,
    height: layout.height,
    width: layout.width,
  });

  return { svg, layout };
}

export async function renderSatoriImage(
  exportData: ExportData,
  modules: Module[],
  options: ViewportOptions = {},
) {
  const { svg } = await renderSatoriSvg(exportData, modules, options);

  const resvg = new Resvg(
    svg,
    options.pixelRatio && options.pixelRatio > 1
      ? { fitTo: { mode: 'zoom', value: options.pixelRatio } }
      : undefined,
  );

  return resvg.render().asPng();
}
