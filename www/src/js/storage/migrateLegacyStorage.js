// @flow

import { mapValues } from 'lodash';
import type { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import type { ColorMapping, TimetablesState } from 'types/reducers';
import type { Semester } from 'types/modules';
import config from 'config';
import { defaultCorsNotificationState } from 'reducers/settings';
import { fillColorMapping } from 'utils/colors';

function splitColorMap(
  timetables: ModuleLessonConfig,
  colors: ColorMapping,
): { [Semester]: ColorMapping } {
  return mapValues(timetables, (timetable: SemTimetableConfig) =>
    fillColorMapping(timetable, colors),
  );
}

/* eslint-disable no-param-reassign */
export default function migrateLegacyStorage(original: ?Object) {
  if (!original) return original;

  // Convert legacy storage state into the new one -

  // 1. Migrate timetables
  const { timetables, theme } = original;
  if (timetables) {
    original.timetables = ({
      // Move existing timetables data structure to under lessonConfig
      timetableConfig: timetables,
      // Move colors from under theme to timetables
      colors: splitColorMap(timetables, theme.colors || {}),
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
