// @flow
import type { Middleware } from 'redux';
import diff, { type Difference } from 'deep-diff';
import { SYNC_DATA_RECEIVED } from 'actions/sync';
import { fetchModule } from 'actions/moduleBank';

export type SyncCompleter = (dispatch: Function, stateDiff: Difference[], newState: Object) => void;

// Dispatch fetch module actions if modules were added and they aren't in the moduleBank.
// Exported for unit tests.
export const fetchAddedModules: SyncCompleter = (dispatch, stateDiff, newState) => {
  // Get module codes of all added modules
  const addedModules = stateDiff
    .filter(
      (diffObj) =>
        diffObj.kind === 'N' && // Only care about additions
        diffObj.path.length === 4 && // Path format: ['timetables', 'lessons', '<sem>', '<modCode>']
        diffObj.path[0] === 'timetables' &&
        diffObj.path[1] === 'lessons',
    )
    .map((diffObj) => diffObj.path[3]);

  if (addedModules.length === 0) return;

  // Ignore all modules that are already in the module bank
  const moduleBankModules = newState.moduleBank.modules;
  const modulesToFetch = addedModules.filter((moduleCode) => !moduleBankModules[moduleCode]);
  modulesToFetch.forEach((moduleCode) => dispatch(fetchModule(moduleCode)));
};

// Compares store state before and after sync, and calls completers if state changed.
// Exported for unit tests.
export function createSyncCompleterMiddleware(completers: SyncCompleter[]) {
  const syncCompleterMiddleware: Middleware<*, *, *> = (store) => (next) => (action) => {
    if (action.type !== SYNC_DATA_RECEIVED) return next(action);

    const oldState = store.getState();
    const result = next(action);
    const newState = store.getState();

    const differences = diff.diff(oldState, newState);
    if (differences) {
      completers.forEach((completer) => completer(store.dispatch, differences, newState));
    }

    return result;
  };
  return syncCompleterMiddleware;
}

export default createSyncCompleterMiddleware([fetchAddedModules]);
