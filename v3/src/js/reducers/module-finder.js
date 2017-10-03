// @flow
import type { ModuleFinderState } from 'types/reducers';
import type { FSA } from 'types/redux';

import { SEARCH_MODULES, RESET_MODULE_FINDER } from 'actions/module-finder';

const defaultState: ModuleFinderState = {
  searchTerm: '',
};

export default function moduleFinder(state: ModuleFinderState = defaultState, action: FSA): ModuleFinderState {
  switch (action.type) {
    case RESET_MODULE_FINDER:
      return defaultState;

    case SEARCH_MODULES:
      return {
        ...state,
        searchTerm: action.payload.searchTerm,
      };

    default:
      return state;
  }
}
