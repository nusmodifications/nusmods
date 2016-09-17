// @flow

import _ from 'lodash';
import moment from 'moment';
import type {
  Lesson,
  Module,
  ModuleCode,
  Semester,
  SemesterData,
  TimetableLesson,
} from 'types/modules';

const DATE_FORMAT: string = 'Do MMM YYYY h:mm A';

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

// Returns a formatted exam time for a module in that semester.
export function getExamTime(module: Module, semester: Semester): string {
  const examDate = _.get(getModuleSemesterData(module, semester), 'ExamDate');
  return examDate ? moment(examDate).format(DATE_FORMAT) : '-';
}
