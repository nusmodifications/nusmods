import { groupBy, isEmpty, last, mapValues } from 'lodash-es';

import { RawLesson } from 'types/modules';

import {
  TimetableDayArrangement,
  TimetableDayFormat,
  TimetableArrangement,
} from 'types/timetables';

//  Groups flat array of lessons by day.
//  {
//    Monday: [Lesson, Lesson, ...],
//    Tuesday: [Lesson, ...],
//  }
export function groupLessonsByDay<T extends RawLesson>(lessons: T[]): TimetableDayFormat<T> {
  return groupBy(lessons, (lesson) => lesson.day);
}

//  Determines if two lessons overlap:
export function doLessonsOverlap(lesson1: RawLesson, lesson2: RawLesson): boolean {
  return (
    lesson1.day === lesson2.day &&
    lesson1.startTime < lesson2.endTime &&
    lesson2.startTime < lesson1.endTime
  );
}

//  Converts a flat array of lessons *for ONE day* into rows of lessons within that day row.
//  Result invariants:
//  - Each lesson will not overlap with each other.
//  [
//    [Lesson, Lesson, ...],
//    [Lesson, ...],
//  ]
export function arrangeLessonsWithinDay<T extends RawLesson>(
  lessons: T[],
): TimetableDayArrangement<T> {
  const rows: T[][] = [[]];
  if (isEmpty(lessons)) {
    return rows;
  }
  const sortedLessons = lessons.sort((a, b) => {
    const timeDiff = a.startTime.localeCompare(b.startTime);
    return timeDiff !== 0 ? timeDiff : a.classNo.localeCompare(b.classNo);
  });
  sortedLessons.forEach((lesson: T) => {
    for (let i = 0; i < rows.length; i++) {
      const rowLessons: T[] = rows[i];
      const previousLesson = last(rowLessons);
      if (!previousLesson || !doLessonsOverlap(previousLesson, lesson)) {
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
//  Clashes in Array<Lesson> will go onto the next row within that day.
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
export function arrangeLessonsForWeek<T extends RawLesson>(lessons: T[]): TimetableArrangement<T> {
  const dayLessons = groupLessonsByDay(lessons);
  return mapValues(dayLessons, (dayLesson: T[]) => arrangeLessonsWithinDay(dayLesson));
}
