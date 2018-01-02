// @flow
import type { FSA } from 'types/redux';
import type { TimetableConfig } from 'types/timetables';
import type { Requests, SettingsState, AppState, ModuleFinderState } from 'types/reducers';
import type { ModuleBank } from 'reducers/moduleBank';
import type { VenueBank } from 'reducers/venueBank';
import type { UndoHistoryState } from 'reducers/undoHistory';

import requests from './requests';
import moduleBank from './moduleBank';
import venueBank from './venueBank';
import timetables from './timetables';
import app from './app';
import theme from './theme';
import settings from './settings';
import moduleFinder from './moduleFinder';
import { undoHistoryReducer, undoReducer } from './undoHistory';

export type State = {
  moduleBank: ModuleBank,
  venueBank: VenueBank,
  requests: Requests,
  timetables: TimetableConfig,
  app: AppState,
  theme: Object,
  settings: SettingsState,
  moduleFinder: ModuleFinderState,
  undoHistory: UndoHistoryState,
};

// $FlowFixMe: State default is delegated to its child reducers.
const defaultState: State = {};

export default function(state: State = defaultState, action: FSA): State {
  // Calculate un/redone history
  let unredoneState = {
    ...state,
    undoHistory: undoHistoryReducer(state.undoHistory, action),
  };

  // Merge "present" state in undoHistory with state
  // Implemented as a reducer as middleware are not
  // allowed to mutate state.
  unredoneState = undoReducer(unredoneState, action);

  // Update every other reducer
  return {
    moduleBank: moduleBank(unredoneState.moduleBank, action),
    venueBank: venueBank(unredoneState.venueBank, action),
    requests: requests(unredoneState.requests, action),
    timetables: timetables(unredoneState.timetables, action),
    app: app(unredoneState.app, action),
    theme: theme(unredoneState.theme, action),
    settings: settings(unredoneState.settings, action),
    moduleFinder: moduleFinder(unredoneState.moduleFinder, action),
    undoHistory: unredoneState.undoHistory,
  };
}
