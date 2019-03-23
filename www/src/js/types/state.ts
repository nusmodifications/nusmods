import { ModuleBank, UndoHistoryState, VenueBank } from 'reducers/constants';
import {
  AppState,
  ModuleFinderState,
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
