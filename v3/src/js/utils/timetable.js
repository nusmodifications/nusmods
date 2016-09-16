/* @flow */

import _ from 'lodash';

export const FIRST_HOUR: number = 8;
export const LAST_HOUR: number = 22;
export const CELLS_COUNT: number = ((LAST_HOUR - FIRST_HOUR) + 1) * 2;
export const LESSON_TYPE_ABBREV: Object = {
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
//    [LessonType]: [
//      {
//        ClassNo: A,
//        ...Lesson
//      },
//      {
//        ClassNo: A,
//        ...Lesson
//      }
//    ],
//    ...
//  }
export function randomLessonConfig(lessons: Array<Object>): Object {
  return _(lessons)
    .groupBy('LessonType')
    .mapValues((group: Object) => {
      return _.groupBy(group, 'ClassNo');
    })
    .mapValues((group: Object) => {
      return _.sample(group);
    })
    .value();
}

// Filters a flat array of lessons and returns the lessons corresponding to lessonType.
export function lessonsForLessonType(lessons: Array<Object>, lessonType: string): Array<Object> {
  return _.filter(lessons, (lesson: Object) => lesson.LessonType === lessonType);
}

//  Converts from timetable config format to flat array of lessons.
//  {
//    [ModuleCode]: {
//      [LessonType]: [
//        { ...Lesson },
//        { ...Lesson },
//      ],
//      ...
//    }
//  }
export function timetableLessonsArray(timetable: Array<Object>): Array<Object> {
  return _.flatMapDepth(timetable, (lessonType: string) => {
    return _.values(lessonType);
  }, 2);
}

//  Groups flat array of lessons by day.
//  {
//    Monday: [{ ...Lesson }, { ...Lesson }, ...],
//    Tuesday: [{ ...Lesson }, { ...Lesson }, ...]
//  }
export function groupLessonsByDay(lessons: Array<Object>): Object {
  return _.groupBy(lessons, 'DayText');
}

//  Determines if two lessons of the same day overlap. Only start/end time is being checked
export function doLessonsOverlap(lesson1: Object, lesson2: Object): boolean {
  return lesson1.StartTime < lesson2.EndTime && lesson2.StartTime < lesson1.EndTime;
}

//  Converts a flat array of lessons *within a day* into rows:
//  Result invariants:
//  - Each lesson will not overlap with each other.
//  [
//    [{ ...Lesson }, { ...Lesson }, ...],
//    [{ ...Lesson }, ...],
//  ]
export function arrangeLessonsWithinDay(lessons: Array<Object>): Array<Array<Object>> {
  const rows: Array<Array<Object>> = [[]];
  if (_.isEmpty(lessons)) {
    return rows;
  }

  lessons.forEach((lesson: Object) => {
    for (let i = 0, length = rows.length; i < length; i++) {
      const rowLessons: Array<Object> = rows[i];
      // Search through lessons in row to look for available slots.
      const overlapTests = _.map(rowLessons, (rowLesson) => {
        return !doLessonsOverlap(rowLesson, lesson);
      });
      if (_.every(overlapTests)) {
        // Lesson does not overlap with any lessons in the row. Add it to row.
        rowLessons.push(lesson);
        return;
      }
    }
    // No existing rows are available to fit this lesson in. Append a new row.
    rows.push([lesson]);
  });

  return rows;
}

//  Accepts a flat array of lessons and group them by day and rows with each day
//  for rendering on the timetable.
//  Clashes in timetable will go onto the next row within that day.
//  {
//    Monday: [
//      [{ ...Lesson }, { ...Lesson }, ...],
//    ],
//    Tuesday: [
//      [{ ...Lesson }, { ...Lesson }, { ...Lesson }, ...],
//      [{ ...Lesson }, { ...Lesson },],
//      [{ ...Lesson }, ...],
//    ],
//    ...
//  }
export function arrangeLessonsForWeek(lessons: Array<Object>): Object {
  const dayLessons: Object = groupLessonsByDay(lessons);
  return _.mapValues(dayLessons, (dayLesson: Array<Object>) => {
    return arrangeLessonsWithinDay(dayLesson);
  });
}

//  Determines if a lesson on the timetable can be modifiable / dragged around.
//  Condition for this is that there are multiple ClassNo for all the lessons in a LessonType.
export function areOtherClassesAvailable(moduleLessons: Array<Object>,
                                          lessonType: string): boolean {
  const lessonTypeGroups = _.groupBy(moduleLessons, 'LessonType');
  if (!lessonTypeGroups[lessonType]) {
    // No such LessonType.
    return false;
  }
  return Object.keys(_.groupBy(lessonTypeGroups[lessonType], 'ClassNo')).length > 1;
}
