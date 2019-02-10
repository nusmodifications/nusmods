import { FSA } from 'types/redux';
import {
  AppState,
  ModuleFinderState,
  PlannerState,
  Requests,
  SettingsState,
  TimetablesState,
} from 'types/reducers';
import { ModuleBank } from 'reducers/moduleBank';
import { VenueBank } from 'reducers/venueBank';
import { UndoHistoryState } from 'reducers/undoHistory';

import { REMOVE_MODULE, SET_TIMETABLE } from 'actions/timetables';

import persistReducer from 'storage/persistReducer';

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
import plannerReducer from './planner';

export type State = {
  moduleBank: ModuleBank;
  venueBank: VenueBank;
  requests: Requests;
  timetables: TimetablesState;
  app: AppState;
  theme: Object;
  settings: SettingsState;
  moduleFinder: ModuleFinderState;
  planner: PlannerState;
  undoHistory: UndoHistoryState;
};

// Persist reducers
const moduleBank = persistReducer('moduleBank', moduleBankReducer, moduleBankPersistConfig);
const venueBank = persistReducer('venueBank', venueBankReducer, venueBankPersistConfig);
const timetables = persistReducer('timetables', timetablesReducer, timetablesPersistConfig);
const theme = persistReducer('theme', themeReducer);
const settings = persistReducer('settings', settingsReducer);
const planner = persistReducer('planner', plannerReducer);

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
    planner: planner(state.planner, action),
    undoHistory: state.undoHistory,
  };
  return undoReducer(state, newState, action);
}
