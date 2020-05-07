import { REHYDRATE } from 'redux-persist/es/constants';

import * as app from 'actions/app';
import * as exportActions from 'actions/export';
import * as moduleBank from 'actions/moduleBank';
import * as planner from 'actions/planner';
import * as settings from 'actions/settings';
import * as theme from 'actions/theme';
import * as timetables from 'actions/timetables';
import * as undoHistory from 'actions/undoHistory';
import * as venueBank from 'actions/venueBank';
import { ExtractActionShape } from './redux';

type AppAction = ExtractActionShape<typeof app>;
type ExportActionsAction = ExtractActionShape<typeof exportActions>;
type ModuleBankAction =
  | ExtractActionShape<typeof moduleBank.Internal>
  | moduleBank.ModuleBankRequestActions;
type PlannerAction = ExtractActionShape<typeof planner>;
type SettingsAction = ExtractActionShape<typeof settings>;
type ThemeAction = ExtractActionShape<typeof theme>;
type TimetablesAction =
  | ExtractActionShape<typeof timetables>
  | ExtractActionShape<typeof timetables.Internal>;
type UndoHistoryAction = ExtractActionShape<typeof undoHistory>;
type VenueBankAction = venueBank.VenueActions;

type InitActions = {
  type: 'INIT';
  payload: null;
};

type ReduxPersistActions = {
  type: typeof REHYDRATE;
  payload: null;
};

export type Actions =
  | AppAction
  | ExportActionsAction
  | ModuleBankAction
  | PlannerAction
  | SettingsAction
  | ThemeAction
  | TimetablesAction
  | UndoHistoryAction
  | VenueBankAction
  | ReduxPersistActions
  | InitActions;
