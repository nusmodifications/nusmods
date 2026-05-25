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
import { REMEMBER_REHYDRATED } from 'redux-remember';
import { State } from 'types/state';

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
  type: typeof REMEMBER_REHYDRATED;
  payload: State;
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
