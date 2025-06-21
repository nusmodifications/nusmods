import { LessonType, ModuleCode } from 'types/modules';

export interface LessonOption {
  moduleCode: ModuleCode;
  lessonType: LessonType;
  colorIndex: number;
  displayText: string;
  uniqueKey: string;
}

export interface LessonDaysData {
  uniqueKey: string;
  moduleCode: ModuleCode;
  lessonType: LessonType;
  displayText: string;
  days: Set<string>;
}

export interface FreeDayConflict {
  moduleCode: ModuleCode;
  lessonType: LessonType;
  displayText: string;
  conflictingDays: string[];
}
