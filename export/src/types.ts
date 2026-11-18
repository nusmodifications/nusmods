import type { Page } from 'puppeteer-core';

// These types are duplicated from `website/`.
// TODO: Move these types to a shared package.
export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';
export type ColorIndex = number;
export type ColorMapping = { [moduleCode: string]: ColorIndex };
export type ThemeState = Readonly<{
  id: string;
  showTitle: boolean;
  timetableOrientation: TimetableOrientation;
}>;
export type ColorScheme = 'LIGHT_COLOR_SCHEME' | 'DARK_COLOR_SCHEME';
export type Semester = number;
export type ClassNo = string; // E.g. "1", "A"
export type LessonType = string; // E.g. "Lecture", "Tutorial"
export type DayText =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';
type StartTime = string; // E.g. "1000"
type EndTime = string; // E.g. "1200"
type Venue = string; // E.g. "LT26"
type LessonId = string; // E.g. "1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13"

type NumericWeeks = Readonly<Array<number>>;
export type WeekRange = {
  // The start and end dates
  end: string;
  start: string;
  // Number of weeks between each lesson. If not specified one week is assumed
  // ie. there are lessons every week
  weekInterval?: number;
  // Week intervals for modules with uneven spacing between lessons
  weeks?: Array<number>;
};
export type Weeks = NumericWeeks | WeekRange;

export type ModuleCode = string; // E.g. "CS3216"
type ModuleTitle = string; // E.g. "Software Product Engineering for Digital Markets"

export type SemTimetableConfig = {
  [moduleCode: ModuleCode]: ModuleLessonConfig;
};
export interface ModuleLessonConfig {
  [lessonType: LessonType]: ClassNo;
}
export type TaModulesConfig = {
  [moduleCode: ModuleCode]: Array<[lessonType: LessonType, classNo: ClassNo]>;
};

// `ExportData` is duplicated from `website/src/types/export.ts`.
export type ExportData = {
  readonly colors: ColorMapping;
  readonly hidden: Array<ModuleCode>;
  readonly semester: Semester;
  readonly settings: {
    colorScheme: ColorScheme;
  };
  readonly ta: TaModulesConfig;
  readonly theme: ThemeState;
  readonly timetable: SemTimetableConfig;
};

export interface State {
  data: ExportData;
  page: Page;
}

// RawLesson is a lesson time slot obtained from the API.
// Lessons do not implement a modifiable interface.
// They have to be injected in before using in the timetable.
// Usually ModuleCode and ModuleTitle has to be injected in before using in the timetable.
export type RawLesson = Readonly<{
  classNo: ClassNo;
  day: DayText;
  endTime: EndTime;
  lessonType: LessonType;
  startTime: StartTime;
  venue: Venue;
  weeks: Weeks;
}>;

//  ModuleLessonConfigWithLessons is a mapping of lessonType to an array of Lessons for a module.
export type Lesson = RawLesson & {
  moduleCode: ModuleCode;
  title: ModuleTitle;
};

/**
 * Mapping of lessons to their respective lesson ID and lesson type\
 */
export type ModuleLessonMap = {
  [lessonType: LessonType]: {
    [lessonId: LessonId]: RawLesson;
  };
};
