import { SemTimetableConfig } from 'types/timetables';
import { Semester, ModuleCode } from 'types/modules';
import { Mode } from 'types/settings';
import { ColorMapping, ThemeState } from 'types/reducers';

export type ExportData = {
  readonly semester: Semester;
  readonly timetable: SemTimetableConfig;
  readonly colors: ColorMapping;
  readonly hidden: ModuleCode[];
  readonly theme: ThemeState;
  readonly settings: {
    mode: Mode;
  };
};
