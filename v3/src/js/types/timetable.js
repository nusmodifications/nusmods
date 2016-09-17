// @flow

import type {
  ClassNo,
  DayText,
  Lesson,
  LessonType,
  ModuleCode,
  TimetableLesson,
} from 'types/modules';

//  LessonConfig is a mapping of LessonType to an array of Lessons.
//  The array of Lessons have to belong to that LessonType.
export type LessonConfig = {
  [key: LessonType]: Array<Lesson>,
};

// TimetableConfig is the timetable data for each semester.
export type TimetableConfig = {
  [key: ModuleCode]: {
    [key: LessonType]: {
      [key: ClassNo]: Array<TimetableLesson>,
    },
  },
};

// TimetableDayFormat is timetable data grouped by DayText.
export type TimetableDayFormat = {
  [key: DayText]: Array<TimetableLesson>,
};

// TimetableDayArrangement is the arrangement of lessons on the timetable within a day.
export type TimetableDayArrangement = Array<Array<TimetableLesson>>;

// TimetableArrangement is the arrangement of lessons on the timetable for a week.
export type TimetableArrangement = {
  [key: DayText]: TimetableDayArrangement,
};
