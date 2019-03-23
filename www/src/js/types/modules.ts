// Components within a module:
import {
  AcadYear,
  Department,
  Faculty,
  Lesson,
  ModuleCode,
  ModuleTitle,
  RawLesson,
  Semester,
  WeekRange,
  Weeks,
  Workload,
} from './modulesBase';
import { ColorIndex } from './reducers';

/**
 * Typesafe helper functions for consuming Weeks
 */
export const isWeekRange = (week: Weeks): week is WeekRange => !Array.isArray(week);

export const consumeWeeks = <T = void>(
  weeks: Weeks,
  consumeNumericWeeks: (weeks: number[]) => T,
  consumeWeekRange: (weekRange: WeekRange) => T,
): T => {
  if (Array.isArray(weeks)) return consumeNumericWeeks(weeks);
  return consumeWeekRange(weeks as WeekRange);
};

// Recursive tree of module codes and boolean operators for the prereq tree
export type PrereqTree = string | { and?: PrereqTree[]; or?: PrereqTree[] };

// Auxiliary data types
export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const WorkingDays: ReadonlyArray<Day> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DaysOfWeek: ReadonlyArray<Day> = [...WorkingDays, 'Sunday'];

export type ModuleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 8;
export const Semesters: ReadonlyArray<Semester> = [1, 2, 3, 4];

export type WorkloadComponent = 'Lecture' | 'Tutorial' | 'Laboratory' | 'Project' | 'Preparation';

// Workload components as defined by CORS, in their correct positions (see below).
export const WORKLOAD_COMPONENTS: WorkloadComponent[] = [
  'Lecture',
  'Tutorial',
  'Laboratory',
  'Project',
  'Preparation',
];

// RawLesson is a lesson time slot obtained from the API.

// Semester-specific information of a module.
export type SemesterData = {
  semester: Semester;
  timetable: ReadonlyArray<RawLesson>;

  // Exam
  examDate?: string;
  examDuration?: number;
};

// Information for a module for a particular academic year.
export type Module = {
  acadYear: AcadYear;

  // Basic info
  moduleCode: ModuleCode;
  title: ModuleTitle;

  // Additional info
  description?: string;
  moduleCredit: string;
  department: Department;
  faculty: Faculty;
  workload?: Workload;
  aliases?: ModuleCode[];

  // Requsites
  prerequisite?: string;
  corequisite?: string;
  preclusion?: string;

  // Semester data
  semesterData: ReadonlyArray<SemesterData>;

  // Requisites
  prereqTree?: PrereqTree;
  fulfillRequirements?: ReadonlyArray<ModuleCode>;
};

export type ModuleWithColor = Module & {
  colorIndex: ColorIndex;
  hiddenInTimetable: boolean;
};

// This format is returned from the module list endpoint.
export type ModuleCondensed = Readonly<{
  moduleCode: ModuleCode;
  title: ModuleTitle;
  semesters: ReadonlyArray<number>;
}>;

// RawLessons obtained from API does not include ModuleCode and ModuleTitle by default.
// They have to be injected in before using in the timetable.
export type Lesson = RawLesson & {
  moduleCode: ModuleCode;
  title: ModuleTitle;
};

export type ColoredLesson = Lesson & {
  colorIndex: number;
};

type Modifiable = {
  isModifiable?: boolean;
  isAvailable?: boolean;
  isActive?: boolean;
  colorIndex: number;
};

// Lessons do not implement a modifiable interface.
export type ModifiableLesson = ColoredLesson & Modifiable;
