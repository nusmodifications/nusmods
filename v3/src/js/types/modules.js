// @flow
import type { ColorIndex } from 'types/reducers';
import { flatMap } from 'lodash';
import type { BiddingStat } from './cors';

// Components within a module:
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
export type Semester = number; // E.g. 0/1/2/3/4. 3 and 4 means special sem i and ii.
export type Venue = string;
export type WeekText = string; // E.g. "Every Week", "Odd Week"

// Auxiliary data types
const DaysOfWeekEnum = {
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
};

export const DaysOfWeek = Object.keys(DaysOfWeekEnum);
export type Day = $Keys<typeof DaysOfWeekEnum>;

const TimesOfDayEnum = {
  Morning: 'Morning',
  Afternoon: 'Afternoon',
  Evening: 'Evening',
};

export const TimesOfDay = Object.keys(TimesOfDayEnum);
export type Time = $Keys<typeof TimesOfDayEnum>;

export const Timeslots: [Day, Time][] = flatMap(DaysOfWeek, (day): [Day, Time][] => {
  return TimesOfDay.map(time => [day, time]);
});

export type ModuleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const Semesters = [1, 2, 3, 4];

export type WorkloadComponent = 'Lecture' | 'Tutorial' | 'Laboratory' | 'Project' | 'Preparation';

// RawLesson is a lesson time slot obtained from the API.
// Usually ModuleCode and ModuleTitle has to be injected in before using in the timetable.
export type RawLesson = {
  ClassNo: ClassNo,
  DayText: DayText,
  EndTime: EndTime,
  LessonType: LessonType,
  StartTime: StartTime,
  Venue: Venue,
  WeekText: WeekText,
};

// Semester-specific information of a module.
export type SemesterData = {
  ExamDate?: string,
  LecturePeriods: Array<string>,
  Semester: Semester,
  Timetable: Array<RawLesson>,
  TutorialPeriods?: Array<string>,
};

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
  ModuleDescription?: string,
  ModuleTitle: ModuleTitle,
  Preclusion?: string,
  Prerequisite?: string,
  Types: Array<string>,
  Workload?: string,
};

export type ModuleWithColor = Module & { colorIndex: ColorIndex } & { hiddenInTimetable: boolean };

// This format is returned from the module list endpoint.
export type ModuleCondensed = {
  ModuleCode: ModuleCode,
  ModuleTitle: ModuleTitle,
  Semesters: Array<number>,
};

// RawLessons obtained from API does not include ModuleCode and ModuleTitle by default.
// They have to be injected in before using in the timetable.
export type Lesson = RawLesson & {
  ModuleCode: ModuleCode,
  ModuleTitle: ModuleTitle,
};

type Modifiable = {
  isModifiable?: boolean,
  isAvailable?: boolean,
  isActive?: boolean,
  colorIndex: number,
};

// Lessons do not implement a modifiable interface.
export type ModifiableLesson = Lesson & Modifiable;
