// @flow
import type { PerReducerSyncConfig } from 'types/sync';
import createSyncMiddleware from 'middlewares/sync-middleware';

import { syncConfig as timetablesSyncConfig } from 'reducers/timetables';
import { syncConfig as settingsSyncConfig } from 'reducers/settings';
import { syncConfig as themeSyncConfig } from 'reducers/theme';

const perReducerSyncConfig: PerReducerSyncConfig = {
  timetables: timetablesSyncConfig(),
  settings: settingsSyncConfig,
  theme: themeSyncConfig,
};

export default createSyncMiddleware(perReducerSyncConfig);
