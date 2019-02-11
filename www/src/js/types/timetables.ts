import {
  ClassNo,
  Lesson,
  ColoredLesson,
  LessonType,
  ModuleCode,
  ModifiableLesson,
} from 'types/modules';

//  ModuleLessonConfig is a mapping of LessonType to ClassNo for a module.
export type ModuleLessonConfig = {
  [lessonType: string]: ClassNo;
};

// SemTimetableConfig is the timetable data for each semester.
export type SemTimetableConfig = {
  [moduleCode: string]: ModuleLessonConfig;
};

//  ModuleLessonConfigWithLessons is a mapping of LessonType to an array of Lessons for a module.
//  The array of Lessons must belong to that LessonType.
export type ModuleLessonConfigWithLessons = {
  [lessonType: string]: Lesson[];
};

// SemTimetableConfig is the timetable data for each semester with lessons data.
export type SemTimetableConfigWithLessons = {
  [moduleCode: string]: ModuleLessonConfigWithLessons;
};

// TimetableConfig is the timetable data for the whole academic year.
export type TimetableConfig = {
  [semester: string]: SemTimetableConfig;
};

// TimetableDayFormat is timetable data grouped by DayText.
export type TimetableDayFormat = {
  [dayText: string]: ColoredLesson[];
};

// TimetableDayArrangement is the arrangement of lessons on the timetable within a day.
export type TimetableDayArrangement = ModifiableLesson[][];

// TimetableArrangement is the arrangement of lessons on the timetable for a week.
export type TimetableArrangement = {
  [dayText: string]: TimetableDayArrangement;
};

// Represents the lesson which the user is currently hovering over.
// Used to highlight lessons which have the same classNo
export type HoverLesson = {
  readonly classNo: ClassNo;
  readonly moduleCode: ModuleCode;
  readonly lessonType: LessonType;
};
