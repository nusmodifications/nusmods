// @flow
import test from 'ava';

import type { EventOption } from 'ical-generator';
import {
  RECESS_WEEK,
  iCalEventForLesson,
  iCalForTimetable,
  datesForAcademicWeeks,
  daysAfter,
  iCalEventForExam,
  isTutorial,
} from 'utils/ical';

import bfs1001 from '../mocks/modules/BFS1001.json';
import cs1010s from '../mocks/modules/CS1010S.json';
import cs3216 from '../mocks/modules/CS3216.json';
import mockTimetable from '../mocks/sem-timetable.json';

/* Build a RawLesson of a given type */
const rawLessonOfType = lessonType => (
  {
    ClassNo: '1',
    DayText: 'Monday',
    EndTime: '1600',
    LessonType: lessonType,
    StartTime: '1400',
    Venue: 'SR1',
    WeekText: 'Every Week',
  }
);

test('isTutorial should return true for tutorials', (t) => {
  t.true(isTutorial(rawLessonOfType('Design Lecture')));
  t.true(isTutorial(rawLessonOfType('Laboratory')));
  t.true(isTutorial(rawLessonOfType('Recitation')));
  t.true(isTutorial(rawLessonOfType('Tutorial')));
  t.true(isTutorial(rawLessonOfType('Tutorial Type 2')));
  t.true(isTutorial(rawLessonOfType('Tutorial Type 3')));
  t.false(isTutorial(rawLessonOfType('Lecture')));
});

test('datesForAcademicWeeks should return correct dates', (t) => {
  t.deepEqual(
    datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 1),
    new Date('2016-08-10T10:00+0800'));

  t.deepEqual(
    datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 3),
      new Date('2016-08-24T10:00+0800'));

  // recess week
  t.deepEqual(
    datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), RECESS_WEEK),
      new Date('2016-09-21T10:00+0800'));

  // week 7 is after recess week, so it is 8 weeks after the start
  t.deepEqual(
    datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 7),
      new Date('2016-09-28T10:00+0800'));
});

test('daysAfter should create a date days after', (t) => {
  t.deepEqual(
    daysAfter(new Date('2016-11-23T09:00+0800'), 1),
    new Date('2016-11-24T09:00+0800'));
});

test('iCalEventForExam should generate event', (t) => {
  const actual: ?EventOption = iCalEventForExam(cs1010s, 1);
  const expected: EventOption = {
    start: new Date('2016-11-23T09:00+0800'),
    end: new Date('2016-11-23T11:00+0800'),
    summary: 'CS1010S Exam',
    description: 'Programming Methodology',
    url: 'http://www.nus.edu.sg/registrar/event/examschedule-sem1.html',
  };
  t.deepEqual(actual, expected);
});

test('iCalEventForLesson generates exclusion for comma separated weeks', (t) => {
  const actual: EventOption = iCalEventForLesson(
    {
      ClassNo: 'A1',
      DayText: 'Monday',
      EndTime: '1700',
      LessonType: 'Sectional Teaching',
      StartTime: '1400',
      Venue: 'BIZ1-0303',
      WeekText: '1,2,3,4,5,6',
    },
    bfs1001,
    1,
    new Date('2016-08-08T00:00+0800'),
  );
  const expected: EventOption = {
    start: new Date('2016-08-08T14:00+0800'),
    end: new Date('2016-08-08T17:00+0800'),
    summary: 'BFS1001 Sectional Teaching',
    description: 'Personal Development & Career Management\nSectional Teaching Group A1',
    location: 'BIZ1-0303',
    url: 'https://myaces.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?' +
      'acad_y=2016/2017&sem_c=1&mod_c=BFS1001',
    repeating: {
      freq: 'WEEKLY',
      count: 14,
      byDay: ['Mo'],
      exclude: [
        new Date('2016-09-19T14:00+0800'),
        new Date('2016-09-26T14:00+0800'),
        new Date('2016-10-03T14:00+0800'),
        new Date('2016-10-10T14:00+0800'),
        new Date('2016-10-17T14:00+0800'),
        new Date('2016-10-24T14:00+0800'),
        new Date('2016-10-31T14:00+0800'),
        new Date('2016-11-07T14:00+0800'),
      ],
    },
  };
  t.deepEqual(actual, expected);
});

test('icalForTimetable', (t) => {
  const moduleData = {
    CS1010S: cs1010s,
    CS3216: cs3216,
  };
  const actual = iCalForTimetable(1, mockTimetable, moduleData);
  // 5 lesson types for cs1010s, 1 for cs3216, 1 exam for cs1010s
  t.true(actual.length === 7);
});
