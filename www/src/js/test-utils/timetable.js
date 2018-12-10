// @flow// A generic lesson with some default.
import type {
  ClassNo,
  ColoredLesson,
  DayText,
  Lesson,
  LessonTime,
  LessonType,
} from 'types/modules';

export function createGenericLesson(
  dayText: DayText = 'Monday',
  startTime: LessonTime = '0800',
  endTime: LessonTime = '1000',
  lessonType: LessonType = 'Recitation',
  classNo: ClassNo = '1',
): Lesson {
  return {
    ModuleCode: 'GC1101',
    ModuleTitle: 'Generic Title',
    ClassNo: classNo,
    LessonType: lessonType,
    WeekText: 'Every Week',
    Venue: 'VCRm',
    DayText: dayText,
    StartTime: startTime,
    EndTime: endTime,
  };
}

export function createGenericColoredLesson(
  dayText?: DayText,
  startTime?: LessonTime,
  endTime?: LessonTime,
  lessonType?: LessonType,
  classNo?: ClassNo,
  colorIndex: number = 0,
): ColoredLesson {
  return {
    ...createGenericLesson(dayText, startTime, endTime, lessonType, classNo),
    colorIndex,
  };
}
