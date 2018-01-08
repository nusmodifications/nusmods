// @flow
import type { FSA } from 'types/redux';
import type { TimetableConfig } from 'types/timetables';
import type { Requests, SettingsState, AppState, ModuleFinderState } from 'types/reducers';
import type { ModuleBank } from 'reducers/moduleBank';
import type { VenueBank } from 'reducers/venueBank';
import type { UndoHistoryState } from 'reducers/undoHistory';

import { ADD_MODULE, REMOVE_MODULE, SET_TIMETABLE } from 'actions/timetables';

import requests from './requests';
import moduleBank from './moduleBank';
import venueBank from './venueBank';
import timetables from './timetables';
import app from './app';
import theme from './theme';
import settings from './settings';
import moduleFinder from './moduleFinder';
import undoHistory from './undoHistory';

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
const unredo = undoHistory({
  reducerName: 'undoHistory',
  actionsToWatch: [ADD_MODULE, REMOVE_MODULE, SET_TIMETABLE],
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
  return unredo(state, newState, action);
}
