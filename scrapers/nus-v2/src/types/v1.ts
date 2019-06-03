// These are the types from NUSMods API v1, used mainly for the migration script

// Components within a module:
type AcadYear = string; // E.g. "2016/2017"
type ClassNo = string; // E.g. "1", "A"
type DayText = string; // E.g. "Monday", "Tuesday"
type Department = string;
type StartTime = string; // E.g. "1400"
type EndTime = string; // E.g. "1500"
type Faculty = string;
type LessonType = string; // E.g. "Lecture", "Tutorial"
type LessonTime = StartTime | EndTime;
type ModuleCode = string; // E.g. "CS3216"
type ModuleTitle = string;
type Semester = number; // E.g. 1/2/3/4. 3 and 4 means special sem i and ii.
type WeekText = string; // E.g. "Every Week", "Odd Week"
type Venue = string;

// Auxiliary data types
type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';


type Time = 'Morning' | 'Afternoon' | 'Evening';

type ModuleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 8;

type WorkloadComponent = 'Lecture' | 'Tutorial' | 'Laboratory' | 'Project' | 'Preparation';

// RawLesson is a lesson time slot obtained from the API.
// Usually ModuleCode and ModuleTitle has to be injected in before using in the timetable.
export type V1RawLesson = {
  ClassNo: ClassNo;
  DayText: DayText;
  EndTime: EndTime;
  LessonType: LessonType;
  StartTime: StartTime;
  Venue: Venue;
  WeekText: WeekText;
};

// Semester-specific information of a module.
export type V1SemesterData = {
  readonly ExamDate?: string;
  readonly LecturePeriods: string[];
  readonly Semester: Semester;
  readonly Timetable: V1RawLesson[];
  readonly TutorialPeriods?: string[];
};

// Recursive definition for walking a module tree
export type Tree = {
  readonly name: string;
  // Tree[] will result in infinite loop
  readonly children: Tree[];
};

// Information for a module for a particular academic year.
// This is probably the only model you need to be concerned with.
// For some reason es6 object literal property value shorthand is not recognized >_<
export type V1Module = {
  AcadYear: AcadYear;
  Corequisite?: string;
  Department: Department;
  History: V1SemesterData[];
  ModuleCode: ModuleCode;
  ModuleCredit: string;
  ModuleDescription?: string;
  ModuleTitle: ModuleTitle;
  Preclusion?: string;
  Prerequisite?: string;
  Types: string[];
  Workload?: string;
  ModmavenTree: Tree;
  LockedModules?: ModuleCode[];
};

// This format is returned from the module list endpoint.
export type V1ModuleCondensed = {
  readonly ModuleCode: ModuleCode;
  readonly ModuleTitle: ModuleTitle;
  readonly Semesters: number[];
};
