// @flow
import type { State } from 'reducers';
import { extractStateForExport, serializeExportState } from 'utils/export';

const baseUrl = '/export';

function serializeState(state: State) {
  return serializeExportState(extractStateForExport(state.app.activeSemester, state));
}

export default {
  image: (state: State) => `${baseUrl}/image?${serializeState(state)}`,
  pdf: (state: State) => `${baseUrl}/pdf?${serializeState(state)}`,
};
