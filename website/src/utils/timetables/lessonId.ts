import { invert } from 'lodash-es';

import { LessonType } from 'types/modules';

import { Lesson } from 'types/timetables';

type lessonTypeAbbrev = { [lessonType: string]: string };
export const LESSON_TYPE_ABBREV: lessonTypeAbbrev = {
  'Design Lecture': 'DLEC',
  Laboratory: 'LAB',
  Lecture: 'LEC',
  'Packaged Laboratory': 'PLAB',
  'Packaged Lecture': 'PLEC',
  'Packaged Tutorial': 'PTUT',
  Recitation: 'REC',
  'Sectional Teaching': 'SEC',
  'Seminar-Style Module Class': 'SEM',
  Tutorial: 'TUT',
  'Tutorial Type 2': 'TUT2',
  'Tutorial Type 3': 'TUT3',
  Workshop: 'WS',
};

// Reverse lookup map of LESSON_TYPE_ABBREV
export const LESSON_ABBREV_TYPE: { [key: string]: LessonType } = invert(LESSON_TYPE_ABBREV);

/**
 * Obtain a semi-unique key for a lesson
 */
export function getLessonIdentifier(lesson: Lesson): string {
  return `${lesson.moduleCode}-${LESSON_TYPE_ABBREV[lesson.lessonType]}-${lesson.classNo}`;
}
