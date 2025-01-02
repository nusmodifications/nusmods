import type { Page } from 'puppeteer-core';

export type Semester = number;
export type ClassNo = string; // E.g. "1", "A"
export type LessonType = string; // E.g. "Lecture", "Tutorial"
export type ModuleCode = string; // E.g. "CS3216"
export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';
export type ColorScheme = 'LIGHT_COLOR_SCHEME' | 'DARK_COLOR_SCHEME';

export interface PageData {
  readonly semester: Semester;
  readonly timetable: SemTimetableConfig;
  readonly hidden: ModuleCode[];
  readonly ta: TaModulesConfig;
  readonly theme: ThemeState;
  readonly settings: {
    colorScheme: ColorScheme;
  };
}

export type SemTimetableConfig = {
  [moduleCode: string]: ModuleLessonConfig;
};

export interface ModuleLessonConfig {
  [lessonType: LessonType]: ClassNo;
}

export type TaModulesConfig = {
  [moduleCode: ModuleCode]: [lessonType: LessonType, classNo: ClassNo][];
};

export type ThemeState = Readonly<{
  id: string;
  timetableOrientation: TimetableOrientation;
  showTitle: boolean;
}>;

export interface State {
  data: PageData;
  page: Page;
}
