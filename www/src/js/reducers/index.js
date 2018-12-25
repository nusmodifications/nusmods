// @flow
import type { FSA } from 'types/redux';
import type {
  AppState,
  ModuleFinderState,
  Requests,
  SettingsState,
  TimetablesState,
} from 'types/reducers';
import type { ModuleBank } from 'reducers/moduleBank';
import type { VenueBank } from 'reducers/venueBank';
import type { UndoHistoryState } from 'reducers/undoHistory';

import { REMOVE_MODULE, SET_TIMETABLE } from 'actions/timetables';

import persistReducer from 'storage/persistReducer';
import syncReducer from 'reducers/sync';

// Non-persisted reducers
import requests from './requests';
import app from './app';
import moduleFinder from './moduleFinder';
import createUndoReducer from './undoHistory';

// Persisted reducers
import moduleBankReducer, { persistConfig as moduleBankPersistConfig } from './moduleBank';
import venueBankReducer, { persistConfig as venueBankPersistConfig } from './venueBank';
import timetablesReducer, { persistConfig as timetablesPersistConfig } from './timetables';
import themeReducer from './theme';
import settingsReducer from './settings';

export type State = {
  moduleBank: ModuleBank,
  venueBank: VenueBank,
  requests: Requests,
  timetables: TimetablesState,
  app: AppState,
  theme: Object,
  settings: SettingsState,
  moduleFinder: ModuleFinderState,
  undoHistory: UndoHistoryState,
};

// Convenience function to both persist and sync a reducer
const persistAndSyncReducer = (key: string, reducer: Function, config) =>
  // $FlowFixMe - 'S is incompatible with undefined in the first argument'?
  persistReducer(key, syncReducer(key, reducer), config);

// Persist reducers
const moduleBank = persistReducer('moduleBank', moduleBankReducer, moduleBankPersistConfig);
const venueBank = persistReducer('venueBank', venueBankReducer, venueBankPersistConfig);
const timetables = persistAndSyncReducer('timetables', timetablesReducer, timetablesPersistConfig);
const theme = persistAndSyncReducer('theme', themeReducer);
const settings = persistAndSyncReducer('settings', settingsReducer);

// $FlowFixMe: State default is delegated to its child reducers.
const defaultState: State = {};
const undoReducer = createUndoReducer({
  limit: 1,
  reducerName: 'undoHistory',
  actionsToWatch: [REMOVE_MODULE, SET_TIMETABLE],
  whitelist: ['timetables', 'theme.colors'],
});

export default function(state: State = defaultState, action: FSA): State {
  // Update every reducer except the undo reducer
  const newState: State = {
    moduleBank: moduleBank(state.moduleBank, action),
    venueBank: venueBank(state.venueBank, action),
    requests: requests(state.requests, action),
    timetables: timetables(state.timetables, action),
    app: app(state.app, action),
    theme: theme(state.theme, action),
    settings: settings(state.settings, action),
    moduleFinder: moduleFinder(state.moduleFinder, action),
    undoHistory: state.undoHistory,
  };
  return undoReducer(state, newState, action);
}
