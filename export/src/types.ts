import type { Page } from 'puppeteer-core';

// These types are duplicated from `website/`.
// TODO: Move these types to a shared package.
export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';
export type Semester = number;
export type SemTimetableConfig = {
  [moduleCode: string]: ModuleLessonConfig;
};
export type ColorIndex = number;
export type ColorMapping = { [moduleCode: string]: ColorIndex };
export type ModuleCode = string;
export type ThemeState = Readonly<{
  id: string;
  timetableOrientation: TimetableOrientation;
  showTitle: boolean;
}>;
export type ColorScheme = 'LIGHT_COLOR_SCHEME' | 'DARK_COLOR_SCHEME';

// `ExportData` is duplicated from `website/src/types/export.ts`.
export interface ExportData {
  readonly semester: Semester;
  readonly timetable: SemTimetableConfig;
  readonly colors: ColorMapping;
  readonly hidden: ModuleCode[];
  readonly theme: ThemeState;
  readonly settings: {
    colorScheme: ColorScheme;
  };
}

export interface ModuleLessonConfig {
  [lessonType: string]: string;
}

export interface State {
  data: ExportData;
  page: Page;
}
