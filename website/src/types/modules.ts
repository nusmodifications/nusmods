// Components within a module:
export type AcadYear = string;
export type ClassNo = string;
export type DayText = string;
export type StartTime = string;
export type EndTime = string;
export type Faculty = string;
export type LessonTime = StartTime | EndTime;
export type LessonType = string;
export type ModuleCode = string;
export type ModuleTitle = string;
export type Semester = number;
export type Department = string;
export type Workload = string | readonly number[];
export type Venue = string;
export type Weeks = NumericWeeks | WeekRange;
export type NumericWeeks = readonly number[];
export type WeekRange = {
  // The start and end dates
  start: string;
  end: string;
  // Number of weeks between each lesson. If not specified one week is assumed
  // ie. there are lessons every week
  weekInterval?: number;
  // Week intervals for modules with uneven spacing between lessons
  weeks?: number[];
};

// Recursive tree of module codes and boolean operators for the prereq tree
export type PrereqTree = string | { and: PrereqTree[] } | { or: PrereqTree[] };

// Auxiliary data types
export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const WorkingDays: readonly Day[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DaysOfWeek: readonly Day[] = [...WorkingDays, 'Sunday'];

export const Semesters: readonly Semester[] = [1, 2, 3, 4];

export type WorkloadComponent = 'Lecture' | 'Tutorial' | 'Laboratory' | 'Project' | 'Preparation';

// Workload components as defined by CORS, in their correct positions (see below).
export const WORKLOAD_COMPONENTS: WorkloadComponent[] = [
  'Lecture',
  'Tutorial',
  'Laboratory',
  'Project',
  'Preparation',
];

/**
 * Typesafe helper functions for consuming Weeks
 */
export const isWeekRange = (week: Weeks): week is WeekRange => !Array.isArray(week);

export const consumeWeeks = <T = void>(
  weeks: Weeks,
  consumeNumericWeeks: (numericWeeks: NumericWeeks) => T,
  consumeWeekRange: (weekRange: WeekRange) => T,
): T => {
  if (Array.isArray(weeks)) return consumeNumericWeeks(weeks);
  return consumeWeekRange(weeks as WeekRange);
};

export type SearchableModule = {
  moduleCode: ModuleCode;
  title: ModuleTitle;
  description?: string;
};

export type SemesterDataCondensed = Readonly<{
  semester: Semester;
  examDate?: string;
  examDuration?: number;
  // The full timetable is not provided to reduce space
}>;

type AttributeMap = {
  year: boolean; // Year long
  su: boolean; // Can S/U
  grsu: boolean;
  ssgf: boolean; // SkillsFuture Funded
  sfs: boolean; // SkillsFuture series
  lab: boolean; // Lab based
  ism: boolean; // Independent study
  urop: boolean; // Undergraduate Research Opportunities Program
  fyp: boolean; // Honours / Final Year Project
  mpes1: boolean; // Included in Semester 1's Module Planning Exercise
  mpes2: boolean; // Included in Semester 2's Module Planning Exercise
};

export type NUSModuleAttributes = Partial<AttributeMap>;

export const attributeDescription: { [key in keyof AttributeMap]: string } = {
  year: 'Year long module',
  su: 'Has S/U option for Undergraduate students only',
  grsu: 'Has S/U option for relevant Graduate (Research) students only',
  ssgf: 'SkillsFuture funded',
  sfs: 'SkillsFuture series',
  lab: 'Lab based module',
  ism: 'Independent study module',
  urop: 'Undergraduate Research Opportunities Program',
  fyp: 'Honours / Final Year Project',
  mpes1: "Included in Semester 1's Module Planning Exercise",
  mpes2: "Included in Semester 2's Module Planning Exercise",
};

// RawLesson is a lesson time slot obtained from the API.
// Lessons do not implement a modifiable interface.
// They have to be injected in before using in the timetable.
// Usually ModuleCode and ModuleTitle has to be injected in before using in the timetable.
export type RawLesson = Readonly<{
  classNo: ClassNo;
  day: DayText;
  startTime: StartTime;
  endTime: EndTime;
  lessonType: LessonType;
  venue: Venue;
  weeks: Weeks;
}>;

// Semester-specific information of a module.
export type SemesterData = {
  semester: Semester;
  timetable: readonly RawLesson[];

  // Exam
  examDate?: string;
  examDuration?: number;
};

// This format is returned from the module list endpoint.
export type ModuleCondensed = Readonly<{
  moduleCode: ModuleCode;
  title: ModuleTitle;
  semesters: readonly number[];
}>;

// This format is returned from the module information endpoint
// Subset of Module object that contains the properties that are needed for module search
export type ModuleInformation = Readonly<{
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
  attributes?: NUSModuleAttributes;

  // Requsites
  prerequisite?: string;
  corequisite?: string;
  preclusion?: string;

  // Condensed semester info
  semesterData: readonly SemesterDataCondensed[];

  // Requisite tree is not returned to save space
}>;

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
  attributes?: NUSModuleAttributes;

  // Requsites
  prerequisite?: string;
  corequisite?: string;
  preclusion?: string;

  // Semester data
  semesterData: readonly SemesterData[];

  // Requisites
  prereqTree?: PrereqTree;
  fulfillRequirements?: readonly ModuleCode[];

  // Meta
  timestamp: number;
};
