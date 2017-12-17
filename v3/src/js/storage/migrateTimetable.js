// @flow

import localforage from 'localforage';
import qs from 'query-string';
import { invert, each } from 'lodash';

import type { SemTimetableConfig } from 'types/timetables';
import type { Semester, LessonType } from 'types/modules';
import { LESSON_TYPE_ABBREV } from 'utils/timetables';

const LESSON_TYPES: { [string]: LessonType } = invert(LESSON_TYPE_ABBREV);

const migratedKeys: [Semester, string][] = [
  [1, 'timetable/2017-2018/sem1:queryString'],
  [2, 'timetable/2017-2018/sem2:queryString'],
  [3, 'timetable/2017-2018/sem3:queryString'],
  [4, 'timetable/2017-2018/sem4:queryString'],
];

export function parseQueryString(queryString: string): SemTimetableConfig {
  const timetable = {};
  each(qs.parse(queryString), (classNo, key) => {
    const matches = key.match(/(\w{2,3}\d{4}\w{0,2})(?:\[([\w\s]+)])?/);
    if (!matches) return;

    const [, moduleCode, lessonTypeAbbrev] = matches;
    if (!timetable[moduleCode]) {
      timetable[moduleCode] = {};
    }

    if (lessonTypeAbbrev) {
      timetable[moduleCode][LESSON_TYPES[lessonTypeAbbrev]] = classNo;
    }
  });

  return timetable;
}

export default function migrateTimetable(
  setTimetable: (Semester, SemTimetableConfig) => void,
): Promise<Array<?SemTimetableConfig>> {
  const promises = migratedKeys.map(([semester, key]) =>
    localforage.getItem(key)
      .then((queryString) => {
        // Do nothing if there's no data
        if (!queryString) return null;

        const timetable = parseQueryString(queryString);
        setTimetable(semester, timetable);
        return localforage.removeItem(key)
          .then(() => timetable);
      }));

  return Promise.all(promises);
}
