// @flow

// Components within a module:

export type AcadYear = string;     // E.g. "2016/2017"
export type ClassNo = string;      // E.g. "1", "A"
export type DayText = string;      // E.g. "Monday", "Tuesday"
export type Department = string;
export type EndTime = string;      // E.g. "1500"
export type Faculty = string;
export type LessonType = string;   // E.g. "Lecture", "Tutorial"
export type LessonTime = StartTime | EndTime;
export type ModuleCode = string;   // E.g. "CS3216"
export type ModuleTitle = string;
export type Semester = number;     // E.g. 1, 2
export type StartTime = string;    // E.g. "1400"
export type Venue = string;
export type WeekText = string;     // E.g. "Every Week", "Odd Week"

// Information for a module for a particular academic year.
// This is probably the only model you need to be concerned with.
// For some reason es6 object literal property value shorthand is not recognized >_<
export type Module = {
  AcadYear: AcadYear,
  Corequisite?: string,
  CorsBiddingStats: Array<BiddingStat>,
  Department: Department,
  History: Array<SemesterData>,
  ModuleCode: ModuleCode,
  ModuleCredit: string,
  ModuleDescription: string,
  ModuleTitle: ModuleTitle,
  Preclusion?: string,
  Prerequisite?: string,
  Types: Array<string>,
  Workload: ?string,
};

// Semester-specific information of a module.
export type SemesterData = {
  ExamDate: string,
  LecturePeriods: Array<string>,
  Semester: Semester,
  Timetable: Array<Lesson>,
  TutorialPeriods: Array<string>,
};

// Lesson is a lesson time slot obtained from the API.
// Usually ModuleCode and ModuleTitle has to be injected in before using in the timetable.
export type Lesson = {
  ClassNo: ClassNo,
  DayText: DayText,
  EndTime: EndTime,
  LessonType: LessonType,
  StartTime: StartTime,
  Venue: Venue,
  WeekText: WeekText,
};

// Lessons obtained from API does not include ModuleCode and ModuleTitle by default.
// They have to be injected in before using in the timetable.
export type TimetableLesson = Lesson & { ModuleCode?: ModuleCode, ModuleTitle?: ModuleTitle }

// BiddingStat is CORS bidding stats for a particular round for a module.
export type BiddingStat = {
  AcadYear: AcadYear,
  Bidders: string,
  Faculty: Faculty,
  Group: string,
  HighestBid: string,
  LowestBid: string,
  LowestSuccessfulBid: string,
  Quota: string,
  Round: string,
  Semester: string, // Note that this semester type is different from that in SemesterData.
  StudentAcctType: string,
};
