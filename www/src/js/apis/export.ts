import qs from 'query-string';

import { Semester } from 'types/modules';
import { extractStateForExport } from 'utils/export';
import { State } from '../types/state';

export type ExportOptions = {
  pixelRatio?: number;
};

const baseUrl = '/export';

function serializeState(semester: Semester, state: State, options: ExportOptions = {}) {
  return qs.stringify({
    data: JSON.stringify(extractStateForExport(semester, state)),
    ...options,
  });
}

export default {
  image: (semester: Semester, state: State, pixelRatio: number = 1) =>
    `${baseUrl}/image?${serializeState(semester, state, { pixelRatio })}`,
  pdf: (semester: Semester, state: State) => `${baseUrl}/pdf?${serializeState(semester, state)}`,
};
