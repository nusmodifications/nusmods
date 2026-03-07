import { getModules } from './data';
import { renderSatoriImage } from './satori/render-satori';
import type { ExportData, ViewportOptions } from './types';

export async function renderImage(exportData: ExportData, options: ViewportOptions = {}) {
  const startedAt = Date.now();

  const moduleLoadStartedAt = Date.now();
  const modules = await getModules(Object.keys(exportData.timetable));
  const modulesLoadedAt = Date.now();

  const image = await renderSatoriImage(exportData, modules, options);
  console.info(
    JSON.stringify({
      durationMs: Date.now() - startedAt,
      moduleCount: modules.length,
      moduleLoadMs: modulesLoadedAt - moduleLoadStartedAt,
      renderMs: Date.now() - modulesLoadedAt,
      renderer: 'satori',
      type: 'export-image',
    }),
  );
  return image;
}
