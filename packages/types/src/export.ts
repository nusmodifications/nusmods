import type { ModuleCode, Semester } from './modules';
import type { ColorIndex, SemTimetableConfig } from './timetables';

export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';

export type ThemeState = Readonly<{
  id: string;
  showTitle: boolean;
  timetableOrientation: TimetableOrientation;
}>;

export type ColorMapping = { [moduleCode: ModuleCode]: ColorIndex };

export type ColorScheme = 'LIGHT_COLOR_SCHEME' | 'DARK_COLOR_SCHEME';

export type ExportData = {
  readonly colors: ColorMapping;
  readonly hidden: ModuleCode[];
  readonly semester: Semester;
  readonly settings: {
    colorScheme: ColorScheme;
  };
  readonly ta: ModuleCode[];
  readonly theme: ThemeState;
  readonly timetable: SemTimetableConfig;
};
