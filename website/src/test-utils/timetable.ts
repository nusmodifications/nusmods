import { ClassNo, DayText, LessonTime, LessonType } from 'types/modules';
import { ColoredLesson, Lesson } from 'types/timetables';

export const EVERY_WEEK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
export const EVEN_WEEK = [2, 4, 6, 8, 10, 12];
export const ODD_WEEK = [1, 3, 5, 7, 9, 11, 13];

// A generic lesson with some default.
export function createGenericLesson(
  dayText: DayText = 'Monday',
  startTime: LessonTime = '0800',
  endTime: LessonTime = '1000',
  lessonType: LessonType = 'Recitation',
  classNo: ClassNo = '1',
): Lesson {
  return {
    moduleCode: 'GC1101',
    title: 'Generic Title',
    classNo,
    lessonType,
    weeks: EVERY_WEEK,
    venue: 'VCRm',
    day: dayText,
    startTime,
    endTime,
  };
}

export function createGenericColoredLesson(
  dayText?: DayText,
  startTime?: LessonTime,
  endTime?: LessonTime,
  lessonType?: LessonType,
  classNo?: ClassNo,
  colorIndex = 0,
): ColoredLesson {
  return {
    ...createGenericLesson(dayText, startTime, endTime, lessonType, classNo),
    colorIndex,
  };
}
