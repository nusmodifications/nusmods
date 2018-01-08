// @flow

import { mapValues, get } from 'lodash';
import type { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import type {
  ColorMapping,
  SemesterColorMap,
  HiddenModulesMap,
  TimetablesState,
} from 'types/reducers';
import type { ModuleCode } from 'types/modules';
import config from 'config';
import { defaultCorsNotificationState } from 'reducers/settings';
import { fillColorMapping } from 'utils/colors';

function splitColorMap(timetables: ModuleLessonConfig, colors: ColorMapping): SemesterColorMap {
  return mapValues(timetables, (timetable: SemTimetableConfig) =>
    fillColorMapping(timetable, colors),
  );
}

function splitHiddenModules(
  timetables: ModuleLessonConfig,
  hiddenModules: ModuleCode[],
): HiddenModulesMap {
  return mapValues(timetables, (timetable: SemTimetableConfig) =>
    hiddenModules.filter((moduleCode) => moduleCode in timetable),
  );
}

/* eslint-disable no-param-reassign */
export default function migrateLegacyStorage(original: ?Object) {
  if (!original) return original;

  // Convert legacy storage state into the new one -

  // 1. Migrate timetables
  const { timetables } = original;
  if (timetables) {
    original.timetables = ({
      // Move existing timetables data structure to under lessonConfig
      lessons: timetables,
      // Move colors from under theme to timetables
      colors: splitColorMap(timetables, get(original, 'theme.colors', {})),
      // Hidden modules
      hidden: splitHiddenModules(timetables, get(original, 'settings.hiddenInTimetable', [])),
      // Add academic year key
      academicYear: config.academicYear,
    }: TimetablesState);
  }

  // 2. Ensure Settings is in the correct state
  if (original.settings && !original.settings.corsNotification) {
    original.settings.corsNotification = defaultCorsNotificationState;
  }

  return original;
}
