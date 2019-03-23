export type AcadYear = string; // E.g. "2016/2017"
export type ClassNo = string; // E.g. "1", "A"
export type DayText = string; // E.g. "Monday", "Tuesday"
export type StartTime = string; // E.g. "1400"
export type EndTime = string; // E.g. "1500"
export type Faculty = string;
export type LessonTime = StartTime | EndTime;
export type LessonType = string; // E.g. "Lecture", "Tutorial"
export type ModuleCode = string; // E.g. "CS3216"
export type ModuleTitle = string;
export type Semester = number; // E.g. 1/2/3/4. 3 and 4 means special sem i and ii.
export type Venue = string;
export type Weeks = ReadonlyArray<number> | WeekRange;

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

// This format is returned from the module list endpoint.
export type ModuleCondensed = Readonly<{
  moduleCode: ModuleCode;
  title: ModuleTitle;
  semesters: ReadonlyArray<number>;
}>;

// Subset of Module object that contains the properties that are needed for module search
export type SearchableModule = {
  moduleCode: ModuleCode;
  title: ModuleTitle;
  description?: string;
};

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

// They have to be injected in before using in the timetable.
export type Lesson = RawLesson & {
  moduleCode: ModuleCode;
  title: ModuleTitle;
};

// This format is returned from the module information endpoint
export type Department = string;
export type Workload = string | ReadonlyArray<number>;
export type SemesterDataCondensed = Readonly<{
  semester: Semester;
  examDate?: string;
  examDuration?: number;
  // The full timetable is not provided to reduce space
}>;
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

  // Requsites
  prerequisite?: string;
  corequisite?: string;
  preclusion?: string;

  // Condensed semester info
  semesterData: ReadonlyArray<SemesterDataCondensed>;

  // Requisite tree is not returned to save space
}>;
