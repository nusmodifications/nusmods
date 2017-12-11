// @flow
import type {
  ClassNo,
  DayText,
  Lesson,
  LessonType,
  ModuleCode,
  Semester,
} from 'types/modules';

//  ModuleLessonConfig is a mapping of LessonType to ClassNo for a module.
export type ModuleLessonConfig = {
  [LessonType]: ClassNo,
};

// SemTimetableConfig is the timetable data for each semester.
export type SemTimetableConfig = {
  [ModuleCode]: ModuleLessonConfig,
};

//  ModuleLessonConfigWithLessons is a mapping of LessonType to an array of Lessons for a module.
//  The array of Lessons must belong to that LessonType.
export type ModuleLessonConfigWithLessons = {
  [LessonType]: Lesson[],
};

// SemTimetableConfig is the timetable data for each semester with lessons data.
export type SemTimetableConfigWithLessons = {
  [ModuleCode]: ModuleLessonConfigWithLessons,
};

// TimetableConfig is the timetable data for the whole academic year.
export type TimetableConfig = {
  [Semester]: SemTimetableConfig,
};

// TimetableDayFormat is timetable data grouped by DayText.
export type TimetableDayFormat = {
  [DayText]: Array<Lesson>,
};

// TimetableDayArrangement is the arrangement of lessons on the timetable within a day.
export type TimetableDayArrangement = Array<Array<Lesson>>;

// TimetableArrangement is the arrangement of lessons on the timetable for a week.
export type TimetableArrangement = {
  [DayText]: TimetableDayArrangement,
};
