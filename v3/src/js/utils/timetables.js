// @flow
import type {
  ClassNo,
  Lesson,
  LessonType,
  Module,
  ModuleCode,
  RawLesson,
  Semester,
} from 'types/modules';
import type {
  ModuleLessonConfig,
  SemTimetableConfigWithLessons,
  SemTimetableConfig,
  TimetableDayFormat,
  TimetableDayArrangement,
  TimetableArrangement,
} from 'types/timetables';
import type { ModulesMap } from 'reducers/entities/moduleBank';

import _ from 'lodash';
import { getModuleTimetable } from 'utils/modules';

type LessonTypeAbbrev = { [LessonType]: string };
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
  Workshop: 'WS',
};

export function isValidSemester(semester: Semester): boolean {
  return semester >= 1 && semester <= 4;
}

//  Returns a random configuration of a module's timetable lessons.
//  Used when a module is first added.
//  TODO: Suggest a configuration that does not clash with itself.
//  {
//    [LessonType]: ClassNo,
//  }
export function randomModuleLessonConfig(lessons: Array<RawLesson>): ModuleLessonConfig {
  const lessonByGroups: { [LessonType]: Array<RawLesson> } =
    _.groupBy(lessons, lesson => lesson.LessonType);

  const lessonByGroupsByClassNo: { [LessonType]: { [ClassNo]: Array<RawLesson> } } =
    _.mapValues(lessonByGroups, (lessonsOfSameLessonType: Array<RawLesson>) => {
      return _.groupBy(lessonsOfSameLessonType, lesson => lesson.ClassNo);
    });

  return _.mapValues(lessonByGroupsByClassNo, (group: { [ClassNo]: Array<RawLesson> }) => {
    return _.sample(group)[0].ClassNo;
  });
}

// Replaces ClassNo in SemTimetableConfig with Array<Lesson>
export function hydrateSemTimetableWithLessons(semTimetableConfig: SemTimetableConfig, modules: ModulesMap,
  semester: Semester): SemTimetableConfigWithLessons {
  return _.mapValues(semTimetableConfig, (moduleLessonConfig: ModuleLessonConfig, moduleCode: ModuleCode) => {
    const module: Module = modules[moduleCode];
    // TODO: Split this part into a smaller function: hydrateModuleConfigWithLessons.
    return _.mapValues(moduleLessonConfig, (classNo: ClassNo, lessonType: LessonType) => {
      const lessons: Array<RawLesson> = getModuleTimetable(module, semester);
      const newLessons: Array<RawLesson> = lessons.filter((lesson: RawLesson): boolean => {
        return (lesson.LessonType === lessonType && lesson.ClassNo === classNo);
      });
      const timetableLessons: Array<Lesson> = newLessons.map((lesson: RawLesson): Lesson => {
        return {
          ...lesson,
          ModuleCode: moduleCode,
          ModuleTitle: module.ModuleTitle,
        };
      });
      return timetableLessons;
    });
  });
}

//  Filters a flat array of lessons and returns the lessons corresponding to lessonType.
export function lessonsForLessonType(lessons: Array<RawLesson | Lesson>,
  lessonType: LessonType): Array<RawLesson | Lesson> {
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
  const sortedLessons = _.sortBy(lessons, lesson => lesson.StartTime);
  sortedLessons.forEach((lesson: Lesson) => {
    for (let i = 0, length = rows.length; i < length; i++) {
      const rowLessons: Array<Lesson> = rows[i];
      const previousLesson = _.last(rowLessons);
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
// $FlowFixMe - Flow refuses to accept 'extra' properties on Lesson object
export function arrangeLessonsForWeek(lessons: Lesson[]): TimetableArrangement {
  const dayLessons = groupLessonsByDay(lessons);
  return _.mapValues(dayLessons, (dayLesson: Lesson[]) => arrangeLessonsWithinDay(dayLesson));
}

//  Determines if a Lesson on the timetable can be modifiable / dragged around.
//  Condition: There are multiple ClassNo for all the Array<Lesson> in a LessonType.
export function areOtherClassesAvailable(lessons: Array<RawLesson>,
  lessonType: LessonType): boolean {
  const lessonTypeGroups: Object = _.groupBy(lessons, lesson => lesson.LessonType);
  if (!lessonTypeGroups[lessonType]) {
    // No such LessonType.
    return false;
  }
  return Object.keys(_.groupBy(lessonTypeGroups[lessonType], lesson => lesson.ClassNo)).length > 1;
}

export function colorLessonsByType(lessons: Lesson[]) {
  const types = new Map();
  return lessons.map((lesson) => {
    let colorIndex = types.get(lesson.LessonType);
    if (!types.has(lesson.LessonType)) {
      colorIndex = types.size;
      types.set(lesson.LessonType, colorIndex);
    }

    return { ...lesson, colorIndex };
  });
}
