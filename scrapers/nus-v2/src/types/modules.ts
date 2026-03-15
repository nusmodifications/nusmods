// Components within a module:
import { CovidZoneId } from '../services/getCovidZones';

export type AcadYear = string; // E.g. "2016/2017"
export type ClassNo = string; // E.g. "1", "A"
export type DayText = string; // E.g. "Monday", "Tuesday"
export type Department = string;
export type StartTime = string; // E.g. "1400"
export type EndTime = string; // E.g. "1500"
export type Faculty = string;
export type FacultyCode = string; // E.g. "001", "002"
export type LessonType = string; // E.g. "Lecture", "Tutorial"
export type LessonTime = StartTime | EndTime;
export type ModuleCode = string; // E.g. "CS3216"
export type ModuleTitle = string;
export type Semester = number; // E.g. 1/2/3/4. 3 and 4 means special sem i and ii.
export type Workload = string | Array<number>;
export type Venue = string;

export type WeekRange = {
  end: string;
  // The start and end dates
  start: string;
  // Number of weeks between each lesson. If not specified one week is assumed
  // ie. there are lessons every week
  weekInterval?: number;
  // Week numbers for modules with uneven spacing between lessons. The first
  // occurrence is on week 1
  weeks?: Array<number>;
};

export type Weeks = Array<number> | WeekRange;

// Recursive tree of module codes and boolean operators for the prereq tree
export type PrereqTree =
  | string
  | { and?: Array<PrereqTree>; nOf?: [number, Array<PrereqTree>]; or?: Array<PrereqTree> };

// Auxiliary data types
export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const WorkingDaysOfWeek: Array<Day> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DaysOfWeek: Array<Day> = [...WorkingDaysOfWeek, 'Sunday'];

export type Time = 'Morning' | 'Afternoon' | 'Evening';
export const TimesOfDay: Array<Time> = ['Morning', 'Afternoon', 'Evening'];

export type ModuleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 8;
export const Semesters = [1, 2, 3, 4];

export type WorkloadComponent = 'Lecture' | 'Tutorial' | 'Laboratory' | 'Project' | 'Preparation';

// RawLesson is a lesson time slot obtained from the API.
// Usually ModuleCode and ModuleTitle has to be injected in before using in the timetable.
export type RawLesson = Readonly<{
  classNo: ClassNo;
  covidZone: CovidZoneId;
  day: DayText;
  endTime: EndTime;
  lessonType: LessonType;
  size: number;
  startTime: StartTime;
  venue: Venue;
  weeks: Weeks;
}>;

// Semester-specific information of a module.
export type SemesterData = {
  // Aggregated from timetable
  covidZones: Array<CovidZoneId>;
  // Exam
  examDate?: string;

  examDuration?: number;

  semester: Semester;
  timetable: Array<RawLesson>;
};

export type NUSModuleAttributes = Partial<{
  fyp: boolean; // Honours / Final Year Project
  grsu: boolean; // Can S/U (graduate)
  ism: boolean; // Independent study
  lab: boolean; // Lab based
  mpes1: boolean; // Included in Semester 1's Module Planning Exercise
  mpes2: boolean; // Included in Semester 2's Module Planning Exercise
  sfs: boolean; // SkillsFuture series
  ssgf: boolean; // SkillsFuture Funded
  su: boolean; // Can S/U (undergraduate)
  urop: boolean; // Undergraduate Research Opportunities Program
  year: boolean; // Year long
}>;

// Information for a module for a particular academic year.
export type Module = {
  acadYear: AcadYear;

  additionalInformation?: string;
  aliases?: Array<ModuleCode>;

  attributes?: NUSModuleAttributes;
  corequisite?: string;
  corequisiteRule?: string;
  department: Department;
  // Additional info
  description?: string;
  faculty: Faculty;
  fulfillRequirements?: Array<ModuleCode>;
  gradingBasisDescription?: string;
  // Basic info
  moduleCode: ModuleCode;

  moduleCredit: string;
  preclusion?: string;
  preclusionRule?: string;
  // Requisite tree
  prereqTree?: PrereqTree;
  // Requsites
  prerequisite?: string;
  prerequisiteAdvisory?: string;
  prerequisiteRule?: string;

  // Semester data
  semesterData: Array<SemesterData>;

  title: ModuleTitle;
  workload?: Workload;
};

// This format is returned from the module list endpoint.
export type ModuleCondensed = Readonly<{
  moduleCode: ModuleCode;
  semesters: Array<number>;
  title: ModuleTitle;
}>;

// This format is returned from the module information endpoint
export type SemesterDataCondensed = Readonly<
  // The full timetable is omitted to save space
  Omit<SemesterData, 'timetable'>
>;

export type ModuleInformation = Readonly<{
  attributes?: NUSModuleAttributes;
  corequisite?: string;

  department: Department;
  // Additional info
  description?: string;
  faculty: Faculty;
  gradingBasisDescription?: string;
  // Basic info
  moduleCode: ModuleCode;
  moduleCredit: string;
  preclusion?: string;

  // Requsites
  prerequisite?: string;
  // Condensed semester info
  semesterData: Array<SemesterDataCondensed>;
  title: ModuleTitle;

  workload?: Workload;

  // Requisite tree is not returned to save space
}>;

export type Aliases = {
  [moduleCode: string]: Array<ModuleCode>;
};
