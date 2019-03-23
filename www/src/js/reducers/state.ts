import {
  AppState,
  ModuleFinderState,
  PlannerState,
  Requests,
  SettingsState,
  ThemeState,
  TimetablesState
} from '../types/reducers';
import { ModuleBank } from './moduleBank';
import { UndoHistoryState } from './undoHistory';
import { VenueBank } from './venueBank';

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
