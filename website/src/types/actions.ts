import * as app from 'actions/app';
import * as exportActions from 'actions/export';
import * as moduleBank from 'actions/moduleBank';
import * as planner from 'actions/planner';
import * as settings from 'actions/settings';
import * as theme from 'actions/theme';
import * as timetables from 'actions/timetables';
import * as undoHistory from 'actions/undoHistory';
import * as venueBank from 'actions/venueBank';

import { Filter, Values } from './utils';

export type ExtractActionShape<ActionCreators extends {}> = Filter<
  // Get return types for all exported functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReturnType<Filter<Values<ActionCreators>, (...args: any) => any>>,
  // Exclude non-object returns from redux-thunk actions
  {}
>;

type AppAction = ExtractActionShape<typeof app>;
type ExportActionsAction = ExtractActionShape<typeof exportActions>;
type ModuleBankAction = ExtractActionShape<typeof moduleBank>;
type PlannerAction = ExtractActionShape<typeof planner>;
type SettingsAction = ExtractActionShape<typeof settings>;
type ThemeAction = ExtractActionShape<typeof theme>;
type TimetablesAction = ExtractActionShape<typeof timetables>;
type UndoHistoryAction = ExtractActionShape<typeof undoHistory>;
type VenueBankAction = ExtractActionShape<typeof venueBank>;

export type Actions =
  | AppAction
  | ExportActionsAction
  | ModuleBankAction
  | PlannerAction
  | SettingsAction
  | ThemeAction
  | TimetablesAction
  | UndoHistoryAction
  | VenueBankAction;
