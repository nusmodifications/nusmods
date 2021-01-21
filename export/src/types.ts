import type { Page } from 'puppeteer';

export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';

export interface PageData {
  readonly semester: number;
  readonly timetable: {
    [moduleCode: string]: ModuleLessonConfig;
  };
  readonly settings: {
    readonly hiddenInTimetable: string[];
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
