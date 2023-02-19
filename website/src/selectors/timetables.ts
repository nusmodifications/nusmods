import { createSelector } from 'reselect';

import type { ModuleCode, Semester } from 'types/modules';
import type { State } from 'types/state';

import { fetchArchiveRequest } from 'actions/constants';
import config from 'config';
import { isOngoing, isSuccess } from 'selectors/requests';

export function isArchiveLoading(state: State, moduleCode: ModuleCode) {
  return config.archiveYears.some((year) =>
    isOngoing(state, fetchArchiveRequest(moduleCode, year)),
  );
}

export function availableArchive(state: State, moduleCode: ModuleCode): string[] {
  return config.archiveYears.filter((year) =>
    isSuccess(state, fetchArchiveRequest(moduleCode, year)),
  );
}

const EMPTY_OBJECT = {};

/**
 * Extract semester timetable lessons for a specific semester.
 */
export const getSemesterTimetableLessons = createSelector(
  ({ timetables }: State) => timetables.lessons,
  (lessons) => (semester: Semester | null) =>
    semester === null ? EMPTY_OBJECT : lessons[semester] ?? EMPTY_OBJECT,
);

/**
 * Extract semester timetable colors for a specific semester.
 */
export const getSemesterTimetableColors = createSelector(
  ({ timetables }: State) => timetables.colors,
  (colors) => (semester: Semester | null) =>
    semester === null ? EMPTY_OBJECT : colors[semester] ?? EMPTY_OBJECT,
);

export const getCustomisingLesson = createSelector(
  ({ app }: State) => app.customiseModule,
  (customiseModule) => customiseModule ?? null,
)