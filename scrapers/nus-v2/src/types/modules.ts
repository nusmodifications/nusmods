// Components within a module:
import { CovidZoneId } from '../services/getCovidZones';

export type AcadYear = string; // E.g. "2016/2017"
export type ClassNo = string; // E.g. "1", "A"
export type DayText = string; // E.g. "Monday", "Tuesday"
export type Department = string;
export type StartTime = string; // E.g. "1400"
export type EndTime = string; // E.g. "1500"
export type Faculty = string;
export type LessonType = string; // E.g. "Lecture", "Tutorial"
export type LessonTime = StartTime | EndTime;
export type ModuleCode = string; // E.g. "CS3216"
export type ModuleTitle = string;
export type Semester = number; // E.g. 1/2/3/4. 3 and 4 means special sem i and ii.
export type Workload = string | number[];
export type Venue = string;

export type WeekRange = {
  // The start and end dates
  start: string;
  end: string;
  // Number of weeks between each lesson. If not specified one week is assumed
  // ie. there are lessons every week
  weekInterval?: number;
  // Week numbers for modules with uneven spacing between lessons. The first
  // occurrence is on week 1
  weeks?: number[];
};

export type Weeks = number[] | WeekRange;

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

export const WorkingDaysOfWeek: Day[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DaysOfWeek: Day[] = [...WorkingDaysOfWeek, 'Sunday'];

export type Time = 'Morning' | 'Afternoon' | 'Evening';
export const TimesOfDay: Time[] = ['Morning', 'Afternoon', 'Evening'];

export type ModuleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 8;
export const Semesters = [1, 2, 3, 4];

export type WorkloadComponent = 'Lecture' | 'Tutorial' | 'Laboratory' | 'Project' | 'Preparation';

// RawLesson is a lesson time slot obtained from the API.
// Usually ModuleCode and ModuleTitle has to be injected in before using in the timetable.
export type RawLesson = Readonly<{
  classNo: ClassNo;
  day: DayText;
  endTime: EndTime;
  lessonType: LessonType;
  startTime: StartTime;
  venue: Venue;
  weeks: Weeks;
  size: number;
  covidZone: CovidZoneId;
}>;

// Semester-specific information of a module.
export type SemesterData = {
  semester: Semester;
  timetable: RawLesson[];

  // Aggregated from timetable
  covidZones: CovidZoneId[];

  // Exam
  examDate?: string;
  examDuration?: number;
};

export type NUSModuleAttributes = Partial<{
  year: boolean; // Year long
  su: boolean; // Can S/U (undergraduate)
  grsu: boolean; // Can S/U (graduate)
  ssgf: boolean; // SkillsFuture Funded
  sfs: boolean; // SkillsFuture series
  lab: boolean; // Lab based
  ism: boolean; // Independent study
  urop: boolean; // Undergraduate Research Opportunities Program
  fyp: boolean; // Honours / Final Year Project
  mpes1: boolean; // Included in Semester 1's Module Planning Exercise
  mpes2: boolean; // Included in Semester 2's Module Planning Exercise
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
  semesterData: SemesterData[];

  // Requisite tree
  prereqTree?: PrereqTree;
  fulfillRequirements?: ModuleCode[];
};

// This format is returned from the module list endpoint.
export type ModuleCondensed = Readonly<{
  moduleCode: ModuleCode;
  title: ModuleTitle;
  semesters: number[];
}>;

// This format is returned from the module information endpoint
export type SemesterDataCondensed = Readonly<
  // The full timetable is omitted to save space
  Omit<SemesterData, 'timetable'>
>;

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
  attributes?: NUSModuleAttributes;

  // Requsites
  prerequisite?: string;
  corequisite?: string;
  preclusion?: string;

  // Condensed semester info
  semesterData: SemesterDataCondensed[];

  // Requisite tree is not returned to save space
}>;

export type Aliases = {
  [moduleCode: string]: ModuleCode[];
};
