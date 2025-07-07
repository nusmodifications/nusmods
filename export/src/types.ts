import type { Page } from 'puppeteer-core';

// These types are duplicated from `website/`.
// TODO: Move these types to a shared package.
export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';
export type ColorIndex = number;
export type ColorMapping = { [moduleCode: string]: ColorIndex };
export type ThemeState = Readonly<{
  id: string;
  timetableOrientation: TimetableOrientation;
  showTitle: boolean;
}>;
export type ColorScheme = 'LIGHT_COLOR_SCHEME' | 'DARK_COLOR_SCHEME';
export type Semester = number;
export type ClassNo = string; // E.g. "1", "A"
export type LessonType = string; // E.g. "Lecture", "Tutorial"
export type ModuleCode = string; // E.g. "CS3216"
export type SemTimetableConfig = {
  [moduleCode: ModuleCode]: ModuleLessonConfig;
};
export interface ModuleLessonConfig {
  [lessonType: LessonType]: ClassNo;
}
export type TaModulesConfig = {
  [moduleCode: ModuleCode]: [lessonType: LessonType, classNo: ClassNo][];
};

// `ExportData` is duplicated from `website/src/types/export.ts`.
export type ExportData = {
  readonly semester: Semester;
  readonly timetable: SemTimetableConfig;
  readonly colors: ColorMapping;
  readonly hidden: ModuleCode[];
  readonly ta: TaModulesConfig;
  readonly theme: ThemeState;
  readonly settings: {
    colorScheme: ColorScheme;
  };
};

export interface State {
  data: ExportData;
  page: Page;
}
