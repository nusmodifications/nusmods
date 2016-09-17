// @flow

import _ from 'lodash';
import type {
  Lesson,
  Module,
  ModuleCode,
  Semester,
  SemesterData,
  TimetableLesson,
} from 'types/modules';

export function modulePagePath(moduleCode: ModuleCode): string {
  return `/modules/${moduleCode}`;
}

// Returns semester specific details such as exam date and timetable.
export function getModuleSemesterData(module: Module, semester: Semester): SemesterData {
  return _.find(module.History, (semData: SemesterData) => {
    return semData.Semester === semester;
  });
}

// Returns a flat array of lessons of a module for the corresponding semester.
export function getModuleTimetable(module: Module, semester: Semester): Array<Lesson> {
  return _.get(getModuleSemesterData(module, semester), 'Timetable');
}

// Do these two lessons belong to the same class?
export function areLessonsSameClass(lesson1: TimetableLesson, lesson2: TimetableLesson): boolean {
  return lesson1.ModuleCode === lesson2.ModuleCode &&
    lesson1.ClassNo === lesson2.ClassNo &&
    lesson1.LessonType === lesson2.LessonType;
}

// Convert exam in ISO format to 12-hour date/time format. We slice off the
// SGT time zone and interpret as UTC time, then use the getUTC* methods so
// that they will correspond to Singapore time regardless of the local time
// zone.
export function getExamTime(module: Module, semester: Semester): string {
  function examStr(examDate: string): string {
    const date: Date = new Date(`${examDate.slice(0, 16)}Z`);
    const hours: number = date.getUTCHours();

    const day: string = _.padStart(`${date.getUTCDate().toString()}`, 2, '0');
    const month: string = _.padStart(`${date.getUTCMonth() + 1}`, 2, '0');
    const year: number = date.getUTCFullYear();
    const hour: number = (hours % 12 || 12);
    const minute: string = _.padStart(`${date.getUTCMinutes()}`, 2, '0');
    const amPm: string = (hours < 12 ? 'AM' : 'PM');
    return `${day}-${month}-${year} ${hour}:${minute} ${amPm}`;
  }

  const examDate = _.get(getModuleSemesterData(module, semester), 'ExamDate');
  return examDate ? examStr(examDate) : '-';
}
