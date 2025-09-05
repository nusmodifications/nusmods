import {
  ClassNo,
  LessonIndex,
  LessonType,
  ModuleCode,
  ModuleTitle,
  RawLesson,
  Semester,
} from './modules';

export type ModuleLessonConfig = {
  [lessonType: LessonType]: LessonIndex[];
};

//
/**
 * ModuleLessonConfig is the v1 representation of module configs\
 * It is a mapping of lessonType to classNo\
 * It is only used for type annotations in the migration logic
 */
export type ClassNoModuleLessonConfig = {
  [lessonType: LessonType]: ClassNo;
};

export type SemTimetableConfig = {
  [moduleCode: ModuleCode]: ModuleLessonConfig;
};

/**
 * ClassNoSemTimetableConfig is the v1 representation of semester timetables\
 * It is a mapping of module code to the module config\
 * It is only used for type annotations in the migration logic
 */
export type ClassNoSemTimetableConfig = {
  [moduleCode: ModuleCode]: ClassNoModuleLessonConfig;
};

export type TaModulesConfig = ModuleCode[];

/**
 * ClassNoTaModulesConfig is the v1 representation of TA modules\
 * It is a mapping of moduleCode to the TA's lesson types\
 * It is only used for type annotations in the migration logic
 */
export type ClassNoTaModulesConfig = {
  [moduleCode: ModuleCode]: [lessonType: LessonType, classNo: ClassNo][];
};

//  ModuleLessonConfigWithLessons is a mapping of lessonType to an array of Lessons for a module.
export type Lesson = RawLesson & {
  moduleCode: ModuleCode;
  title: ModuleTitle;
};

export type LessonWithIndex = Lesson & { readonly lessonIndex: LessonIndex };

export type ColoredLesson = Lesson & { colorIndex: ColorIndex };

/**
 * Interactable lessons are lessons that appear on the Timetable page
 *
 * It provides the properties required to determine whether the user:
 * - is currently modifying the lesson
 * - is able to replace the currently selected lesson
 * - is currently in the lesson config
 */
export type InteractableLesson = ColoredLesson & {
  readonly lessonIndex: LessonIndex;
  isTaInTimetable?: boolean;
  canBeSelectedAsActiveLesson?: boolean;
  canBeAddedToLessonConfig?: boolean;
  isActive?: boolean;
};

//  The array of Lessons must belong to that lessonType.
export type ModuleLessonConfigWithLessons = {
  [lessonType: LessonType]: LessonWithIndex[];
};

// SemTimetableConfig is the timetable data for each semester with lessons data.
export type SemTimetableConfigWithLessons = {
  [moduleCode: ModuleCode]: ModuleLessonConfigWithLessons;
};

/**
 * ClassNoTimetableConfig is the v1 representation of the timetable data for the whole academic year\
 * It is a mapping of semesters to semester timetables\
 * It is only used for type annotations in the migration logic
 */
export type ClassNoTimetableConfig = {
  [semester: Semester]: ClassNoSemTimetableConfig;
};

// TimetableConfig is the timetable data for the whole academic year.
export type TimetableConfig = {
  [semester: Semester]: SemTimetableConfig;
};

// TimetableDayFormat is timetable data grouped by DayText.
export type TimetableDayFormat<T extends RawLesson> = {
  [dayText: string]: T[];
};

// TimetableDayArrangement is the arrangement of lessons on the timetable within a day.
export type TimetableDayArrangement<T extends RawLesson> = T[][];

// TimetableArrangement is the arrangement of lessons on the timetable for a week.
export type TimetableArrangement<T extends RawLesson> = {
  [dayText: string]: TimetableDayArrangement<T>;
};

// Represents the lesson which the user is currently hovering over.
// Used to highlight lessons which have the same classNo
export type HoverLesson = {
  readonly classNo: ClassNo;
  readonly moduleCode: ModuleCode;
  readonly lessonType: LessonType;
  readonly lessonIndex: LessonIndex;
};

export type ColorIndex = number;
