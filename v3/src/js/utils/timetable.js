// @flow

import _ from 'lodash';
import type {
  ClassNo,
  Lesson,
  LessonType,
} from 'types/modules';
import type {
  LessonConfig,
  SemTimetableConfig,
  TimetableDayFormat,
  TimetableDayArrangement,
  TimetableArrangement,
} from 'types/timetable';

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
//    [LessonType]: [Lesson, Lesson, ...],
//    [LessonType]: [Lesson, ...],
//  }
export function randomLessonConfig(lessons: Array<Lesson>): LessonConfig {
  const lessonByGroups: { [key: LessonType]: Array<Lesson> } =
    _.groupBy(lessons, lesson => lesson.LessonType);

  const lessonByGroupsByClassNo: { [key: LessonType]: { [key: ClassNo]: Array<Lesson> } } =
    _.mapValues(lessonByGroups, (lessonsOfSameLessonType: Array<Lesson>) => {
      return _.groupBy(lessonsOfSameLessonType, lesson => lesson.ClassNo);
    });

  return _.mapValues(lessonByGroupsByClassNo, (group: { [key: ClassNo]: Array<Lesson> }) => {
    return _.sample(group);
  });
}

//  Filters a flat array of lessons and returns the lessons corresponding to lessonType.
export function lessonsForLessonType(lessons: Array<Lesson>,
                                      lessonType: LessonType): Array<Lesson> {
  return _.filter(lessons, lesson => lesson.LessonType === lessonType);
}

//  Converts from timetable config format to flat array of lessons.
//  {
//    [ModuleCode]: {
//      [LessonType]: [Lesson, Lesson, ...],
//      [LessonType]: [Lesson, ...],
//    }
//  }
export function timetableLessonsArray(timetable: SemTimetableConfig): Array<Lesson> {
  let allLessons: Array<Lesson> = [];
  _.values(timetable).forEach((lessonTypeGroup) => {
    _.values(lessonTypeGroup).forEach((lessons: Array<Lesson>) => {
      allLessons = allLessons.concat(lessons);
    });
  });
  return allLessons;
}

//  Groups flat array of lessons by day.
//  {
//    Monday: [Lesson, Lesson, ...],
//    Tuesday: [Lesson, ...],
//  }
export function groupLessonsByDay(lessons: Array<Lesson>): TimetableDayFormat {
  return _.groupBy(lessons, lesson => lesson.DayText);
}

//  Determines if two lessons overlap:
export function doLessonsOverlap(lesson1: Lesson, lesson2: Lesson): boolean {
  return lesson1.DayText === lesson2.DayText &&
    lesson1.StartTime < lesson2.EndTime &&
    lesson2.StartTime < lesson1.EndTime;
}

//  Converts a flat array of lessons *for ONE day* into rows of lessons within that day row.
//  Result invariants:
//  - Each lesson will not overlap with each other.
//  [
//    [Lesson, Lesson, ...],
//    [Lesson, ...],
//  ]
export function arrangeLessonsWithinDay(lessons: Array<Lesson>): TimetableDayArrangement {
  const rows: TimetableDayArrangement = [[]];
  if (_.isEmpty(lessons)) {
    return rows;
  }

  lessons.forEach((lesson: Lesson) => {
    for (let i = 0, length = rows.length; i < length; i++) {
      const rowLessons: Array<Lesson> = rows[i];
      // Search through Lesson in row to look for available slots.
      const overlapTests = rowLessons.map((rowLesson) => {
        return !doLessonsOverlap(rowLesson, lesson);
      });
      if (_.every(overlapTests, Boolean)) {
        // Lesson does not overlap with any Lesson in the row. Add it to row.
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
//  Clashes in Lessons will go onto the next row within that day.
//  {
//    Monday: [
//      [Lesson, Lesson, ...],
//    ],
//    Tuesday: [
//      [Lesson, Lesson, Lesson, ...],
//      [Lesson, Lesson, ...],
//      [Lesson, ...],
//    ],
//    ...
//  }
export function arrangeLessonsForWeek(lessons: Array<Lesson>): TimetableArrangement {
  const dayLessons: Object = groupLessonsByDay(lessons);
  return _.mapValues(dayLessons, (dayLesson: Array<Lesson>) => {
    return arrangeLessonsWithinDay(dayLesson);
  });
}

//  Determines if a Lesson on the timetable can be modifiable / dragged around.
//  Condition: There are multiple ClassNo for all the Lessons in a LessonType.
export function areOtherClassesAvailable(lessons: Array<Lesson>,
                                          lessonType: LessonType): boolean {
  const lessonTypeGroups: Object = _.groupBy(lessons, lesson => lesson.LessonType);
  if (!lessonTypeGroups[lessonType]) {
    // No such LessonType.
    return false;
  }
  return Object.keys(_.groupBy(lessonTypeGroups[lessonType], lesson => lesson.ClassNo)).length > 1;
}
