// @flow

import _ from 'lodash';
import type {
  ClassNo,
  Lesson,
  LessonType,
  TimetableLesson,
} from '../types/modules';
import type {
  LessonConfig,
  TimetableConfig,
  TimetableDayFormat,
  TimetableDayArrangement,
  TimetableArrangement,
} from '../types/timetable';

export const FIRST_HOUR: number = 8;
export const LAST_HOUR: number = 22;
export const CELLS_COUNT: number = ((LAST_HOUR - FIRST_HOUR) + 1) * 2;

type LessonTypeAbbrev = { [key: LessonType]: string };
export const LESSON_TYPE_ABBREV: LessonTypeAbbrev = {
  'Design Lecture': 'DLEC',
  Laboratory: 'LAB',
  Lecture: 'LEC',
  'Packaged Lecture': 'PLEC',
  'Packaged Tutorial': 'PTUT',
  Recitation: 'REC',
  'Sectional Teaching': 'SEC',
  'Seminar-Style Module Class': 'SEM',
  Tutorial: 'TUT',
  'Tutorial Type 2': 'TUT2',
  'Tutorial Type 3': 'TUT3',
};

//  Returns a random configuration of a module's timetable lessons.
//  Used when a module is first added.
//  TODO: Suggest a configuration that does not clash with itself.
//  {
//    [LessonType]: [TimetableLesson, TimetableLesson, ...],
//    [LessonType]: [TimetableLesson, ...],
//  }
export function randomLessonConfig(lessons: Array<TimetableLesson>): LessonConfig {
  return _(lessons)
    .groupBy('LessonType')
    .mapValues((lessonsOfSameLessonType: Array<Lesson>) => {
      return _.groupBy(lessonsOfSameLessonType, 'ClassNo');
    })
    .mapValues((group: { [key: ClassNo]: Array<Lesson> }) => {
      return _.sample(group);
    })
    .value();
}

//  Filters a flat array of lessons and returns the lessons corresponding to lessonType.
export function lessonsForLessonType(lessons: Array<TimetableLesson>,
                                      lessonType: LessonType): Array<TimetableLesson> {
  return _.filter(lessons, (lesson: TimetableLesson) => lesson.LessonType === lessonType);
}

//  Converts from timetable config format to flat array of lessons.
//  {
//    [ModuleCode]: {
//      [LessonType]: [TimetableLesson, TimetableLesson, ...],
//      [LessonType]: [TimetableLesson, ...],
//    }
//  }
export function timetableLessonsArray(timetable: TimetableConfig): Array<TimetableLesson> {
  return _.flatMapDepth(timetable, (lessonType: LessonType) => {
    return _.values(lessonType);
  }, 2);
}

//  Groups flat array of lessons by day.
//  {
//    Monday: [TimetableLesson, TimetableLesson, ...],
//    Tuesday: [TimetableLesson, ...],
//  }
export function groupLessonsByDay(lessons: Array<TimetableLesson>): TimetableDayFormat {
  return _.groupBy(lessons, 'DayText');
}

//  Determines if two lessons overlap:
//  Condition: These two Lessons are of the same day.
export function doLessonsOverlap(lesson1: Lesson, lesson2: Lesson): boolean {
  return lesson1.StartTime < lesson2.EndTime && lesson2.StartTime < lesson1.EndTime;
}

//  Converts a flat array of lessons *for ONE day* into rows of lessons within that day row.
//  Result invariants:
//  - Each lesson will not overlap with each other.
//  [
//    [TimetableLesson, TimetableLesson, ...],
//    [TimetableLesson, ...],
//  ]
export function arrangeLessonsWithinDay(lessons: Array<TimetableLesson>): TimetableDayArrangement {
  const rows: TimetableDayArrangement = [[]];
  if (_.isEmpty(lessons)) {
    return rows;
  }

  lessons.forEach((lesson: TimetableLesson) => {
    for (let i = 0, length = rows.length; i < length; i++) {
      const rowLessons: Array<TimetableLesson> = rows[i];
      // Search through TimetableLesson in row to look for available slots.
      const overlapTests = _.map(rowLessons, (rowLesson) => {
        return !doLessonsOverlap(rowLesson, lesson);
      });
      if (_.every(overlapTests)) {
        // TimetableLesson does not overlap with any TimetableLesson in the row. Add it to row.
        rowLessons.push(lesson);
        return;
      }
    }
    // No existing rows are available to fit this lesson in. Append a new row.
    rows.push([lesson]);
  });

  return rows;
}

//  Accepts a flat array of lessons and groups them by day and rows with each day
//  for rendering on the timetable.
//  Clashes in TimetableLessons will go onto the next row within that day.
//  {
//    Monday: [
//      [TimetableLesson, TimetableLesson, ...],
//    ],
//    Tuesday: [
//      [TimetableLesson, TimetableLesson, TimetableLesson, ...],
//      [TimetableLesson, TimetableLesson, ...],
//      [TimetableLesson, ...],
//    ],
//    ...
//  }
export function arrangeLessonsForWeek(lessons: Array<TimetableLesson>): TimetableArrangement {
  const dayLessons: Object = groupLessonsByDay(lessons);
  return _.mapValues(dayLessons, (dayLesson: Array<TimetableLesson>) => {
    return arrangeLessonsWithinDay(dayLesson);
  });
}

//  Determines if a TimetableLesson on the timetable can be modifiable / dragged around.
//  Condition: There are multiple ClassNo for all the TimetableLessons in a LessonType.
export function areOtherClassesAvailable(lessons: Array<TimetableLesson>,
                                          lessonType: LessonType): boolean {
  const lessonTypeGroups: Object = _.groupBy(lessons, 'LessonType');
  if (!lessonTypeGroups[lessonType]) {
    // No such LessonType.
    return false;
  }
  return Object.keys(_.groupBy(lessonTypeGroups[lessonType], 'ClassNo')).length > 1;
}
