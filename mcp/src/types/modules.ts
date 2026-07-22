/**
 * Module data types for the NUSMods v2 JSON API.
 *
 * Vendored from `website/src/types/modules.ts` and trimmed to the shapes the MCP
 * server consumes. These match the JSON served by the CDN (the frontend-only
 * computed fields such as `lessonMap` are omitted here).
 *
 * TODO(shared-types): extract into a `packages/nusmods-types` package so the
 * website, scraper and this server share a single source of truth.
 */

export type AcadYear = string;
export type ClassNo = string;
export type DayText = string;
export type StartTime = string;
export type EndTime = string;
export type Faculty = string;
export type LessonType = string;
export type ModuleCode = string;
export type ModuleTitle = string;
export type Semester = number;
export type Department = string;
export type Workload = string | ReadonlyArray<number>;
export type Venue = string;

export type NumericWeeks = ReadonlyArray<number>;
export type WeekRange = {
  end: string;
  // The start and end dates
  start: string;
  // Number of weeks between each lesson. If not specified one week is assumed.
  weekInterval?: number;
  // Week numbers for modules with uneven spacing between lessons.
  weeks?: Array<number>;
};
export type Weeks = NumericWeeks | WeekRange;

// Cohort / program-type predicates that can gate a prereq subtree.
export type CohortRule = 'IF_IN' | 'IF_NOT_IN' | 'MUST_BE_IN' | 'MUST_NOT_BE_IN';
export type CohortCondition = { rule: CohortRule; years: Array<string> };
export type ProgramTypeRule = 'IF_IN' | 'MUST_BE_IN';
export type ProgramTypeCondition = { rule: ProgramTypeRule; types: Array<string> };

// Recursive tree of module codes and boolean operators for the prereq tree.
export type PrereqTree =
  | string
  | { and: Array<PrereqTree> }
  | { or: Array<PrereqTree> }
  | { nOf: [number, Array<PrereqTree>] }
  | { cohort: CohortCondition; then?: PrereqTree }
  | { programType: ProgramTypeCondition; then: PrereqTree };

export type NUSModuleAttributes = Partial<{
  fyp: boolean; // Honours / Final Year Project
  grsu: boolean;
  ism: boolean; // Independent study
  lab: boolean; // Lab based
  mpes1: boolean; // Included in Semester 1's Module Planning Exercise
  mpes2: boolean; // Included in Semester 2's Module Planning Exercise
  sfs: boolean; // SkillsFuture series
  ssgf: boolean; // SkillsFuture funded
  su: boolean; // Can S/U
  urop: boolean; // Undergraduate Research Opportunities Program
  year: boolean; // Year long
}>;

// A single lesson slot as returned by the API.
export type RawLesson = Readonly<{
  classNo: ClassNo;
  day: DayText;
  endTime: EndTime;
  lessonType: LessonType;
  startTime: StartTime;
  venue: Venue;
  weeks: Weeks;
}>;

// Semester-specific information as served in a module's details JSON.
export type SemesterData = Readonly<{
  examDate?: string;
  examDuration?: number;
  semester: Semester;
  timetable: ReadonlyArray<RawLesson>;
}>;

export type SemesterDataCondensed = Readonly<{
  examDate?: string;
  examDuration?: number;
  semester: Semester;
}>;

// Returned from the module list endpoint (`moduleList.json`).
export type ModuleCondensed = Readonly<{
  moduleCode: ModuleCode;
  semesters: ReadonlyArray<number>;
  title: ModuleTitle;
}>;

// Returned from the module information endpoint (`moduleInformation.json`) and
// indexed in ElasticSearch. A search-oriented subset of `Module`.
export type ModuleInformation = Readonly<{
  aliases?: Array<ModuleCode>;
  attributes?: NUSModuleAttributes;

  corequisite?: string;
  department: Department;
  description?: string;
  faculty: Faculty;
  gradingBasisDescription?: string;
  moduleCode: ModuleCode;
  moduleCredit: string;
  preclusion?: string;

  prerequisite?: string;
  semesterData: ReadonlyArray<SemesterDataCondensed>;
  title: ModuleTitle;

  workload?: Workload;
}>;

// Full details for a module in a given academic year (`modules/{code}.json`).
export type Module = Readonly<{
  acadYear: AcadYear;

  additionalInformation?: string;
  aliases?: Array<ModuleCode>;

  attributes?: NUSModuleAttributes;
  corequisite?: string;
  corequisiteRule?: string;
  department: Department;
  description?: string;
  faculty: Faculty;
  fulfillRequirements?: ReadonlyArray<ModuleCode>;
  gradingBasisDescription?: string;
  moduleCode: ModuleCode;

  moduleCredit: string;
  preclusion?: string;
  preclusionRule?: string;
  prereqTree?: PrereqTree;
  prerequisite?: string;
  prerequisiteAdvisory?: string;
  prerequisiteRule?: string;

  semesterData: ReadonlyArray<SemesterData>;

  timestamp: number;
  title: ModuleTitle;

  workload?: Workload;
}>;
