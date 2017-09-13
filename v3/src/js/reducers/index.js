// @flow
import type { FSA } from 'types/redux';
import type {
  Requests,
  SettingsState,
  AppState,
} from 'types/reducers';

import requests from './requests';
import entities from './entities';
import timetables from './timetables';
import app from './app';
import theme from './theme';
import settings from './settings';

type State = {
  entities: Object,
  requests: Requests,
  timetables: Object,
  app: AppState,
  theme: Object,
  settings: SettingsState,
};

// $FlowFixMe: State default is delegated to its child reducers.
const defaultState: State = {};

export default function (state: State = defaultState, action: FSA): State {
  return {
    entities: entities(state.entities, action),
    requests: requests(state.requests, action),
    timetables: timetables(state.timetables, action),
    app: app(state.app, action),
    theme: theme(state.theme, action),
    settings: settings(state.settings, action),
  };
}
