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

// Maps a lessonKey to the classNo the user has pinned for that lesson
export type PinnedSlots = Record<LessonKey, ClassNo>;

export type PinnedSlotOption = {
  classNo: ClassNo;
  label: string;
};

export type PinnedSlotConflict = {
  moduleCode: ModuleCode;
  lessonType: LessonType;
  displayText: DisplayText;
  classNo: ClassNo;
  reasons: string[];
};
