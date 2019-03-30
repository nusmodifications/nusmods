import { ModuleFinderState } from 'types/reducers';
import produce from 'immer';

import { FSA } from 'types/redux';
import { RESET_MODULE_FINDER, SEARCH_MODULES } from 'actions/moduleFinder';
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
      return produce(state, (draft) => {
        draft.search.term = term;
        draft.search.tokens = tokenize(term);
      });
    }

    default:
      return state;
  }
}
