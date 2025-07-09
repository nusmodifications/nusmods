import { DayText, LessonType, ModuleCode } from './modules';
import { ColorIndex } from './timetables';

export type LessonKey = string;
export type DisplayText = string;

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
