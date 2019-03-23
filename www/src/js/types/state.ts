import { ModuleBank, UndoHistoryState, VenueBank } from 'reducers/constants';
import { ModuleFinderState } from './moduleReducers';
import {
  AppState,
  PlannerState,
  Requests,
  SettingsState,
  ThemeState,
  TimetablesState,
} from './reducers';

export type State = {
  moduleBank: ModuleBank;
  venueBank: VenueBank;
  requests: Requests;
  timetables: TimetablesState;
  app: AppState;
  theme: ThemeState;
  settings: SettingsState;
  moduleFinder: ModuleFinderState;
  planner: PlannerState;
  undoHistory: UndoHistoryState;
};
