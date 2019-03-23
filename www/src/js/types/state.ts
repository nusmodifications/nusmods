import {
  AppState,
  ModuleFinderState,
  PlannerState,
  Requests,
  SettingsState,
  ThemeState,
  TimetablesState,
} from './reducers';
import { ModuleBank } from 'reducers/moduleBank';
import { UndoHistoryState } from 'reducers/undoHistory';
import { VenueBank } from 'reducers/venueBank';

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
