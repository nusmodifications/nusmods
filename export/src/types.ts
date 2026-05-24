import type { Page } from 'puppeteer-core';

// These types are duplicated from `website/src/types`.

export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';
export type ColorIndex = number;
export type LessonIndex = number;
export type ColorMapping = { [moduleCode: string]: ColorIndex };
export type ThemeState = Readonly<{
  id: string;
  showTitle: boolean;
  timetableOrientation: TimetableOrientation;
}>;
export type ColorScheme = 'LIGHT_COLOR_SCHEME' | 'DARK_COLOR_SCHEME';
export type Semester = number;
export type ClassNo = string;
export type DayText = string;
export type LessonTime = string;
export type LessonType = string;
export type ModuleCode = string;
export type ModuleTitle = string;
export type Venue = string;

export type WeekRange = {
  end: string;
  start: string;
  weekInterval?: number;
  weeks?: Array<number>;
};

export type Weeks = Array<number> | WeekRange;

export type RawLesson = Readonly<{
  classNo: ClassNo;
  day: DayText;
  endTime: LessonTime;
  lessonType: LessonType;
  startTime: LessonTime;
  venue: Venue;
  weeks: Weeks;
}>;

export type SemesterData = {
  examDate?: string;
  examDuration?: number;
  semester: Semester;
  timetable: ReadonlyArray<RawLesson>;
};

export type Module = {
  moduleCode: ModuleCode;
  moduleCredit: string;
  semesterData: ReadonlyArray<SemesterData>;
  title: ModuleTitle;
};

export type ModuleLessonConfig = {
  [lessonType: LessonType]: Array<LessonIndex>;
};

export type SemTimetableConfig = {
  [moduleCode: ModuleCode]: ModuleLessonConfig;
};

// `ExportData` is duplicated from `website/src/types/export.ts`.
export type ExportData = {
  readonly colors: ColorMapping;
  readonly hidden: Array<ModuleCode>;
  readonly semester: Semester;
  readonly settings: {
    colorScheme: ColorScheme;
  };
  readonly ta: Array<ModuleCode>;
  readonly theme: ThemeState;
  readonly timetable: SemTimetableConfig;
};

export type ViewportOptions = {
  height?: number;
  pixelRatio?: number;
  width?: number;
};

export interface State {
  data: ExportData;
  page: Page;
}
