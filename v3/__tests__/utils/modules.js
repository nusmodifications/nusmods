// @flow

import type { Semester, SemesterData, Lesson } from 'types/modules';

import _ from 'lodash';
import {
  modulePagePath,
  getModuleSemesterData,
  areLessonsSameClass,
  formatExamDate,
  getModuleSemExamDate,
} from 'utils/modules';

import cs1010s from '../mocks/modules/CS1010S.json';
import cs3216 from '../mocks/modules/CS3216.json';

const mockLesson: Lesson = _.cloneDeep(cs1010s.History[0].Timetable[0]);
mockLesson.ModuleCode = 'CS1010S';
mockLesson.ModuleTitle = 'Programming Methodology';

test('modulePagePath should generate route correctly', () => {
  const actual: string = modulePagePath('CS1010S');
  const expected: string = '/modules/CS1010S';
  expect(actual).toBe(expected);
});

test('getModuleSemesterData should return semester data if semester is present', () => {
  const sem: Semester = 1;
  const actual: SemesterData = getModuleSemesterData(cs3216, sem);
  const expected = {
    Semester: 1,
    Timetable: [
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1830',
        EndTime: '2030',
        Venue: 'VCRm',
      },
    ],
    LecturePeriods: ['Monday Evening'],
  };
  expect(actual).toEqual(expected);
});

test('getModuleSemesterData should return undefined if semester is absent', () => {
  const sem: Semester = 2;
  const actual: SemesterData = getModuleSemesterData(cs3216, sem);
  expect(actual).toBe(undefined);
});

function lessonWithDifferentProperty(lesson: Lesson, property: string, newValue: any): Lesson {
  const anotherLesson: Lesson = _.cloneDeep(lesson);
  anotherLesson[property] = newValue || 'TEST';
  return anotherLesson;
}

test('areLessonsSameClass should identify identity lessons as same class', () => {
  const deepClonedLesson: Lesson = _.cloneDeep(mockLesson);
  expect(areLessonsSameClass(mockLesson, deepClonedLesson)).toBe(true);
});

test('areLessonsSameClass should identify lessons from the same ClassNo but ' +
  'with different timings as same class', () => {
  const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'StartTime', '0000');
  const otherLesson2: Lesson = lessonWithDifferentProperty(otherLesson, 'EndTime', '2300');
  expect(areLessonsSameClass(mockLesson, otherLesson2)).toBe(true);
});

test('areLessonsSameClass should identify lessons with different ModuleCode as different class', () => {
  const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'ModuleCode');
  expect(areLessonsSameClass(mockLesson, otherLesson)).toBe(false);
});

test('areLessonsSameClass should identify lessons with different ClassNo as different class', () => {
  const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'ClassNo');
  expect(areLessonsSameClass(mockLesson, otherLesson)).toBe(false);
});

test('areLessonsSameClass should identify lessons with different LessonType as different class', () => {
  const otherLesson: Lesson = lessonWithDifferentProperty(mockLesson, 'LessonType');
  expect(areLessonsSameClass(mockLesson, otherLesson)).toBe(false);
});

test('formatExamDate should format an exam date string correctly', () => {
  expect(formatExamDate('2016-11-23T09:00+0800')).toBe('23-11-2016 9:00 AM');
  expect(formatExamDate('2016-01-23T09:00+0800')).toBe('23-01-2016 9:00 AM');
  expect(formatExamDate('2016-11-03T09:00+0800')).toBe('03-11-2016 9:00 AM');
  expect(formatExamDate('2016-11-03T19:00+0800')).toBe('03-11-2016 7:00 PM');
  expect(formatExamDate('2016-11-03T19:30+0800')).toBe('03-11-2016 7:30 PM');
  expect(formatExamDate('2016-11-03T08:30+0800')).toBe('03-11-2016 8:30 AM');
  expect(formatExamDate('2016-01-03T08:01+0800')).toBe('03-01-2016 8:01 AM');
});

test('getModuleSemExamDate should return the correctly formatted exam timing if it exists', () => {
  const sem: Semester = 1;
  const examTime: string = getModuleSemExamDate(cs1010s, sem);
  expect(examTime).toBe('23-11-2016 9:00 AM');
});

test('getModuleSemExamDate should return - if it does not exist', () => {
  const sem1: Semester = 1;
  expect(getModuleSemExamDate(cs3216, sem1)).toBe('-');

  const sem2: Semester = 2;
  expect(getModuleSemExamDate(cs1010s, sem2)).toBe('-');
});
