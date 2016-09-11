import _ from 'lodash';

export const FIRST_HOUR = 8;
export const LAST_HOUR = 22;
export const CELLS_COUNT = ((LAST_HOUR - FIRST_HOUR) + 1) * 2;
export const LESSON_TYPE_ABBREV = {
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
export function randomLessonConfig(lessons) {
  return _(lessons)
    .groupBy('LessonType')
    .mapValues((group) => {
      return _.groupBy(group, 'ClassNo');
    })
    .mapValues((group) => {
      return _.sample(group);
    })
    .value();
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
export function timetableLessonsArray(timetable) {
  return _.flatMapDepth(timetable, (lessonType) => {
    return _.values(lessonType);
  }, 2);
}

//  Groups flat array of lessons by day.
//  {
//    Monday: [{ ...Lesson }, { ...Lesson }, ...],
//    Tuesday: [{ ...Lesson }, { ...Lesson }, ...]
//  }
export function groupLessonsByDay(lessons) {
  return _.groupBy(lessons, 'DayText');
}

//  Determines if two lessons of the same day overlap. Only start/end time is being checked
export function doLessonsOverlap(lesson1, lesson2) {
  return lesson1.StartTime < lesson2.EndTime && lesson2.StartTime < lesson1.EndTime;
}

//  Converts a flat array of lessons *within a day* into rows:
//  Result invariants:
//  - Each lesson will not overlap with each other.
//  [
//    [{ ...Lesson }, { ...Lesson }, ...],
//    [{ ...Lesson }, ...],
//  ]
export function arrangeLessonsWithinDay(lessons) {
  const rows = [[]];
  if (_.isEmpty(lessons)) {
    return rows;
  }

  lessons.forEach((lesson) => {
    for (let i = 0, length = rows.length; i < length; i++) {
      const rowLessons = rows[i];
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
export function arrangeLessonsForWeek(lessons) {
  const dayLessons = groupLessonsByDay(lessons);
  return _.mapValues(dayLessons, (dayLesson) => {
    return arrangeLessonsWithinDay(dayLesson);
  });
}

//  Determines if a lesson on the timetable can be modifiable / dragged around.
//  Condition for this is that there are multiple ClassNo for all the lessons in a LessonType.
export function areOtherClassesAvailable(moduleLessons, lessonType) {
  const lessonTypeGroups = _.groupBy(moduleLessons, 'LessonType');
  if (!lessonTypeGroups[lessonType]) {
    // No such LessonType.
    return false;
  }
  return Object.keys(_.groupBy(lessonTypeGroups[lessonType], 'ClassNo')).length > 1;
}
