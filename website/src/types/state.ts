import {
  AppState,
  PlannerState,
  Requests,
  SettingsState,
  ThemeState,
  TimetablesState,
  UndoHistoryState,
  VenueBank,
  ModuleBank,
} from './reducers';

export type State = {
  moduleBank: ModuleBank;
  venueBank: VenueBank;
  requests: Requests;
  timetables: TimetablesState;
  app: AppState;
  theme: ThemeState;
  settings: SettingsState;
  planner: PlannerState;
  undoHistory: UndoHistoryState<State>;
};
