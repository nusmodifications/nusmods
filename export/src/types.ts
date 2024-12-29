import type { Page } from 'puppeteer-core';

export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';

export interface PageData {
  readonly semester: number;
  readonly timetable: {
    [moduleCode: string]: ModuleLessonConfig;
  };
  readonly hiddenInTimetable: string[];
  readonly taInTimetable: {
    [moduleCode: string]: [lessonType: string, classNo: string][];
  };
  readonly settings: {
    colorScheme: 'LIGHT_COLOR_SCHEME' | 'DARK_COLOR_SCHEME';
  };
  readonly theme: {
    id: string;
    timetableOrientation: TimetableOrientation;
    showTitle: boolean;
  };
}

export interface ModuleLessonConfig {
  [lessonType: string]: string;
}

export interface State {
  data: PageData;
  page: Page;
}
