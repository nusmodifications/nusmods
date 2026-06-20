import type { ModuleCode, Semester } from './modules';

export type CourseRegStudentType = 'UG' | 'GD';

export type CourseRegRound = 0 | 1 | 2 | 3;

export type CourseRegSlotValue = number | 'notAvailable' | 'unlimited';

export type CourseRegRoundHistory = {
  allocatedSlots: CourseRegSlotValue;
  forecastedSlots: CourseRegSlotValue;
  registered: number | null;
  round: CourseRegRound;
};

export type CourseRegClassHistory = {
  classNo: string;
  rounds: Array<CourseRegRoundHistory>;
  studentType: CourseRegStudentType;
};

export type CourseRegModuleSemesterHistory = {
  acadYear: string;
  classes: Array<CourseRegClassHistory>;
  moduleCode: ModuleCode;
  semester: Semester;
};
