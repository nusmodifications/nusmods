import {
  AppState,
  PlannerState,
  Requests,
  SettingsState,
  ThemeState,
  OptimizerState,
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
  optimizer: OptimizerState;
  settings: SettingsState;
  planner: PlannerState;
  undoHistory: UndoHistoryState<State>;
};
