/* @flow */

import _ from 'lodash';
import moment from 'moment';

const DATE_FORMAT: string = 'Do MMM YYYY h:mm A';

export function modulePagePath(moduleCode: string): string {
  return `/modules/${moduleCode}`;
}

// Returns semester specific details such as exam date and timetable.
export function getModuleHistory(module: Object, semester: number): Object {
  return _.find(module.History, (semData: Object) => {
    return semData.Semester === semester;
  });
}

// Returns a flat array of lessons of a module for the corresponding semester.
export function getModuleTimetable(module: Object, semester: number): Array<Object> {
  return _.get(getModuleHistory(module, semester), 'Timetable');
}

// Do these two lessons belong to the same class?
export function areLessonsSameClass(lesson1: Object, lesson2: Object): boolean {
  return lesson1.ModuleCode === lesson2.ModuleCode &&
    lesson1.ClassNo === lesson2.ClassNo &&
    lesson1.LessonType === lesson2.LessonType;
}

export function getExamTime(module: Object, semester: number): string {
  const examDate = _.get(getModuleHistory(module, semester), 'ExamDate');
  return examDate ? moment(examDate).format(DATE_FORMAT) : '-';
}
