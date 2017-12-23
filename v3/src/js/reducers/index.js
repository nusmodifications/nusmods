// @flow
import type { FSA } from 'types/redux';
import type { TimetableConfig } from 'types/timetables';
import type {
  Requests,
  SettingsState,
  AppState,
  ModuleFinderState,
} from 'types/reducers';

import requests from './requests';
import moduleBank from './moduleBank';
import timetables from './timetables';
import app from './app';
import theme from './theme';
import settings from './settings';
import moduleFinder from './moduleFinder';

export type State = {
  moduleBank: Object,
  requests: Requests,
  timetables: TimetableConfig,
  app: AppState,
  theme: Object,
  settings: SettingsState,
  moduleFinder: ModuleFinderState,
};

// $FlowFixMe: State default is delegated to its child reducers.
const defaultState: State = {};

export default function (state: State = defaultState, action: FSA): State {
  return {
    moduleBank: moduleBank(state.moduleBank, action),
    requests: requests(state.requests, action),
    timetables: timetables(state.timetables, action),
    app: app(state.app, action),
    theme: theme(state.theme, action),
    settings: settings(state.settings, action),
    moduleFinder: moduleFinder(state.moduleFinder, action),
  };
}
