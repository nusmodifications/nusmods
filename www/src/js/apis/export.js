// @flow
import type { State } from 'reducers';
import type { Semester } from 'types/modules';
import { extractStateForExport, serializeExportState } from 'utils/export';

const baseUrl = '/export';

function serializeState(semester: Semester, state: State) {
  return serializeExportState(extractStateForExport(semester, state));
}

export default {
  image: (semester: Semester, state: State) =>
    `${baseUrl}/image?${serializeState(semester, state)}`,
  pdf: (semester: Semester, state: State) => `${baseUrl}/pdf?${serializeState(semester, state)}`,
};
