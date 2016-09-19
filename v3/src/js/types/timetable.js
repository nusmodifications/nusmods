// @flow

import type {
  ClassNo,
  DayText,
  Lesson,
  LessonType,
  ModuleCode,
  Semester,
} from 'types/modules';

//  LessonConfig is a mapping of LessonType to an array of Lessons.
//  The array of Lessons must belong to that LessonType.
export type LessonConfig = {
  [key: LessonType]: Array<Lesson>,
};

// SemTimetableConfig is the timetable data for each semester.
export type SemTimetableConfig = {
  [key: ModuleCode]: {
    [key: LessonType]: {
      [key: ClassNo]: Array<Lesson>,
    },
  },
};

// TimetableConfig is the timetable data for the whole academic year.
export type TimetableConfig = {
  [key: Semester]: SemTimetableConfig,
};

// TimetableDayFormat is timetable data grouped by DayText.
export type TimetableDayFormat = {
  [key: DayText]: Array<Lesson>,
};

// TimetableDayArrangement is the arrangement of lessons on the timetable within a day.
export type TimetableDayArrangement = Array<Array<Lesson>>;

// TimetableArrangement is the arrangement of lessons on the timetable for a week.
export type TimetableArrangement = {
  [key: DayText]: TimetableDayArrangement,
};
