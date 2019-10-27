import { ModuleCode } from 'types/modules';
import config from 'config';
import { isOngoing, isSuccess } from 'selectors/requests';
import { State } from 'types/state';
import { fetchArchiveRequest } from '../actions/constants';

export function isArchiveLoading(state: State, moduleCode: ModuleCode) {
  return config.archiveYears.some((year) =>
    isOngoing(state, fetchArchiveRequest(moduleCode, year)),
  );
}

export function availableArchive(state: State, moduleCode: ModuleCode): string[] {
  return config.archiveYears.filter((year) =>
    isSuccess(state, fetchArchiveRequest(moduleCode, year)),
  );
}
