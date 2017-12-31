// @flow
import type { State } from 'reducers';
import type { Semester } from 'types/modules';
import { extractStateForExport, serializeExportState } from 'utils/export';

const baseUrl = '/export';

function serializeState(semester: Semester, state: State, options: Object = {}) {
  return serializeExportState(extractStateForExport(semester, state), options);
}

export default {
  image: (semester: Semester, state: State, pixelRatio: number = 1) =>
    `${baseUrl}/image?${serializeState(semester, state, { pixelRatio })}`,
  pdf: (semester: Semester, state: State) => `${baseUrl}/pdf?${serializeState(semester, state)}`,
};
