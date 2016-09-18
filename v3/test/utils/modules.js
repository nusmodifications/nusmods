// @flow

import test from 'ava';

import type {
  Semester,
  SemesterData,
  TimetableLesson,
} from 'types/modules';

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

const mockLesson: TimetableLesson = _.cloneDeep(cs1010s.History[0].Timetable[0]);
mockLesson.ModuleCode = 'CS1010S';
mockLesson.ModuleTitle = 'Programming Methodology';

test('modulePagePath should generate route correctly', (t) => {
  const actual: string = modulePagePath('CS1010S');
  const expected: string = '/modules/CS1010S';
  t.is(actual, expected);
});

test('getModuleSemesterData should return semester data if semester is present', (t) => {
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
  t.deepEqual(actual, expected);
});

test('getModuleSemesterData should return undefined if semester is absent', (t) => {
  const sem: Semester = 2;
  const actual: SemesterData = getModuleSemesterData(cs3216, sem);
  t.is(actual, undefined);
});

function lessonWithDifferentProperty(lesson: TimetableLesson, property: string, newValue: any): TimetableLesson {
  const anotherLesson: TimetableLesson = _.cloneDeep(lesson);
  anotherLesson[property] = newValue || 'TEST';
  return anotherLesson;
}

test('areLessonsSameClass should identify identity lessons as same class', (t) => {
  const deepClonedLesson: TimetableLesson = _.cloneDeep(mockLesson);
  t.true(areLessonsSameClass(mockLesson, deepClonedLesson));
});

test('areLessonsSameClass should identify lessons from the same ClassNo but ' +
  'with different timings as same class', (t) => {
  const otherLesson: TimetableLesson = lessonWithDifferentProperty(mockLesson, 'StartTime', '0000');
  const otherLesson2: TimetableLesson = lessonWithDifferentProperty(otherLesson, 'EndTime', '2300');
  t.true(areLessonsSameClass(mockLesson, otherLesson2));
});

test('areLessonsSameClass should identify lessons with different ModuleCode as different class', (t) => {
  const otherLesson: TimetableLesson = lessonWithDifferentProperty(mockLesson, 'ModuleCode');
  t.false(areLessonsSameClass(mockLesson, otherLesson));
});

test('areLessonsSameClass should identify lessons with different ClassNo as different class', (t) => {
  const otherLesson: TimetableLesson = lessonWithDifferentProperty(mockLesson, 'ClassNo');
  t.false(areLessonsSameClass(mockLesson, otherLesson));
});

test('areLessonsSameClass should identify lessons with different LessonType as different class', (t) => {
  const otherLesson: TimetableLesson = lessonWithDifferentProperty(mockLesson, 'LessonType');
  t.false(areLessonsSameClass(mockLesson, otherLesson));
});

test('formatExamDate should format an exam date string correctly', (t) => {
  t.is(formatExamDate('2016-11-23T09:00+0800'), '23-11-2016 9:00 AM');
  t.is(formatExamDate('2016-01-23T09:00+0800'), '23-01-2016 9:00 AM');
  t.is(formatExamDate('2016-11-03T09:00+0800'), '03-11-2016 9:00 AM');
  t.is(formatExamDate('2016-11-03T19:00+0800'), '03-11-2016 7:00 PM');
  t.is(formatExamDate('2016-11-03T19:30+0800'), '03-11-2016 7:30 PM');
  t.is(formatExamDate('2016-11-03T08:30+0800'), '03-11-2016 8:30 AM');
  t.is(formatExamDate('2016-01-03T08:01+0800'), '03-01-2016 8:01 AM');
});

test('getModuleSemExamDate should return the correctly formatted exam timing if it exists', (t) => {
  const sem: Semester = 1;
  const examTime: string = getModuleSemExamDate(cs1010s, sem);
  t.is(examTime, '23-11-2016 9:00 AM');
});

test('getModuleSemExamDate should return - if it does not exist', (t) => {
  const sem1: Semester = 1;
  t.is(getModuleSemExamDate(cs3216, sem1), '-');

  const sem2: Semester = 2;
  t.is(getModuleSemExamDate(cs1010s, sem2), '-');
});
