import { ClassNo, DayText, LessonTime, LessonType, ModuleCode } from './modules';
import { ColorIndex } from './timetables';

export type LessonKey = string;
export type DisplayText = string;

export type TimeRange = {
  earliest: LessonTime;
  latest: LessonTime;
};

export type LessonOption = {
  moduleCode: ModuleCode;
  lessonType: LessonType;
  colorIndex: ColorIndex;
  lessonKey: LessonKey;
  displayText: DisplayText;
  days: DayText[];
};

export type FreeDayConflict = {
  moduleCode: ModuleCode;
  lessonType: LessonType;
  displayText: DisplayText;
  days: DayText[];
};

// Maps a pinned lessonKey to its classNo, derived from the class currently
// selected in the timetable tab
export type PinnedSlots = Record<LessonKey, ClassNo>;

export type TimeRangeConflict = {
  moduleCode: ModuleCode;
  lessonType: LessonType;
  displayText: DisplayText;
  classNo: ClassNo;
};

// One side of a clash between two pinned classes
export type PinnedClashLesson = {
  moduleCode: ModuleCode;
  lessonType: LessonType;
  displayText: DisplayText;
  classNo: ClassNo;
};

export type PinnedClashConflict = {
  first: PinnedClashLesson;
  second: PinnedClashLesson;
};
