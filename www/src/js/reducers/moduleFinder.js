// @flow
import type { ModuleFinderState } from 'types/reducers';
import type { FSA } from 'types/redux';
import update from 'immutability-helper';
import { SEARCH_MODULES, RESET_MODULE_FINDER } from 'actions/moduleFinder';
import { tokenize } from 'utils/moduleSearch';

const defaultState: ModuleFinderState = {
  search: {
    term: '',
    tokens: [],
  },
};

export default function moduleFinder(
  state: ModuleFinderState = defaultState,
  action: FSA,
): ModuleFinderState {
  switch (action.type) {
    case RESET_MODULE_FINDER:
      return defaultState;

    case SEARCH_MODULES: {
      const term = action.payload.searchTerm;
      return update(state, {
        search: {
          term: { $set: term },
          tokens: { $set: tokenize(term) },
        },
      });
    }

    default:
      return state;
  }
}
