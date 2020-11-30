import { ModuleCode, Semester } from 'types/modules';
import { ModuleLessonConfig, SemTimetableConfig } from 'types/timetables';
import { ColorMapping } from 'types/reducers';

export const SET_TIMETABLE = 'SET_TIMETABLE' as const;
export function setTimetable(
  semester: Semester,
  timetable: SemTimetableConfig | undefined,
  colors?: ColorMapping,
) {
  return {
    type: SET_TIMETABLE,
    payload: { semester, timetable, colors },
  };
}

export const ADD_MODULE = 'ADD_MODULE' as const;
export function addModule(
  semester: Semester,
  moduleCode: ModuleCode,
  moduleLessonConfig: ModuleLessonConfig,
) {
  return {
    type: ADD_MODULE,
    semester,
    moduleCode,
    moduleLessonConfig,
  };
}
