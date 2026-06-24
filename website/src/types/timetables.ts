import {
  ClassNo,
  LessonId,
  LessonIndex,
  LessonType,
  ModuleCode,
  ModuleLessonMap,
  ModuleTitle,
  RawLesson,
  Semester,
} from './modules';

export type ModuleLessonConfig = {
  [lessonType: LessonType]: [ClassNo] | LessonId[];
};

/**
 * `ModuleLessonConfigV2` is the v2 representation of module configs\
 * It is a mapping of `LessonType` to `LessonIndex`\
 * It is only used for type annotations in the migration logic
 */
export type ModuleLessonConfigV2 = {
  [lessonType: LessonType]: LessonIndex[];
};

/**
 * `ModuleLessonConfigV1` is the v1 representation of module configs\
 * It is a mapping of `LessonType` to `ClassNo`\
 * It is only used for type annotations in the migration logic
 */
export type ModuleLessonConfigV1 = {
  [lessonType: LessonType]: ClassNo;
};

export type SemTimetableConfig = {
  [moduleCode: ModuleCode]: ModuleLessonConfig;
};

/**
 * `SemTimetableConfigV2` is the v2 representation of semester timetables\
 * It is a mapping of {@link ModuleCode|module code} to the {@link ModuleLessonConfigV2|module config}\
 * It is only used for type annotations in the migration logic
 */
export type SemTimetableConfigV2 = {
  [moduleCode: ModuleCode]: ModuleLessonConfigV2;
};

/**
 * `SemTimetableConfigV1` is the v1 representation of semester timetables\
 * It is a mapping of {@link ModuleCode|module code} to the {@link ModuleLessonConfigV1|module config}\
 * It is only used for type annotations in the migration logic
 */
export type SemTimetableConfigV1 = {
  [moduleCode: ModuleCode]: ModuleLessonConfigV1;
};

/**
 * TaModulesConfigV1 is the v1 representation of TA modules\
 * It is a mapping of {@link ModuleCode|module code} to the {@link LessonType|lesson type} and {@link ClassNo|classNo}\
 * It is only used for type annotations in the migration logic
 */
export type TaModulesConfigV1 = {
  [moduleCode: ModuleCode]: [lessonType: LessonType, classNo: ClassNo][];
};

//  ModuleLessonConfigWithLessons is a mapping of lessonType to an array of Lessons for a module.
export type Lesson = RawLesson & {
  moduleCode: ModuleCode;
  title: ModuleTitle;
};

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
  isTaInTimetable: boolean;
  canBeSelectedAsActiveLesson: boolean;
  canBeAddedToLessonConfig: boolean;
  isActive: boolean;
  lessonId: LessonId;
};

// SemTimetableConfig is the timetable data for each semester with lessons data.
export type SemTimetableConfigWithLessons<T extends Lesson> = {
  [moduleCode: ModuleCode]: ModuleLessonMap<T>;
};

/**
 * TimetableConfigV1 is the v1 representation of the timetable data for the whole academic year\
 * It is a mapping of {@link Semester|semesters} to {@link SemTimetableConfigV1|semester timetables (v1 representation)}\
 * It is only used for type annotations in the migration logic
 */
export type TimetableConfigV1 = {
  [semester: Semester]: SemTimetableConfigV1;
};

// TimetableConfig is the timetable data for the whole academic year.
export type TimetableConfigV2 = {
  [semester: Semester]: SemTimetableConfigV2;
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
  readonly lessonId: LessonId;
};

export type ColorIndex = number;
