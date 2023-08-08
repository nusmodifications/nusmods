import { REMOVE_MODULE, SET_TIMETABLE } from 'actions/timetables';

import persistReducer from 'storage/persistReducer';
import { State } from 'types/state';
import { Actions } from 'types/actions';

// Non-persisted reducers
import requests from './requests';
import app from './app';
import createUndoReducer from './undoHistory';

// Persisted reducers
import moduleBankReducer, { persistConfig as moduleBankPersistConfig } from './moduleBank';
import venueBankReducer, { persistConfig as venueBankPersistConfig } from './venueBank';
import timetablesReducer, { persistConfig as timetablesPersistConfig } from './timetables';
import themeReducer from './theme';
import settingsReducer, { persistConfig as settingsPersistConfig } from './settings';
import plannerReducer, { persistConfig as plannerPersistConfig } from './planner';

// Persist reducers
const moduleBank = persistReducer('moduleBank', moduleBankReducer, moduleBankPersistConfig);
const venueBank = persistReducer('venueBank', venueBankReducer, venueBankPersistConfig);
const timetables = persistReducer('timetables', timetablesReducer, timetablesPersistConfig);
const theme = persistReducer('theme', themeReducer);
const settings = persistReducer('settings', settingsReducer, settingsPersistConfig);
const planner = persistReducer('planner', plannerReducer, plannerPersistConfig);

// State default is delegated to its child reducers.
const defaultState = {} as unknown as State;
const undoReducer = createUndoReducer<State>({
  limit: 1,
  actionsToWatch: [REMOVE_MODULE, SET_TIMETABLE],
  storedKeyPaths: ['timetables', 'theme.colors'],
});

export default function reducers(state: State = defaultState, action: Actions): State {
  // Update every reducer except the undo reducer
  const newState: State = {
    moduleBank: moduleBank(state.moduleBank, action),
    venueBank: venueBank(state.venueBank, action),
    requests: requests(state.requests, action),
    timetables: timetables(state.timetables, action),
    app: app(state.app, action),
    theme: theme(state.theme, action),
    settings: settings(state.settings, action),
    planner: planner(state.planner, action),
    undoHistory: state.undoHistory,
  };
  return undoReducer(state, newState, action);
}
