// @flow
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

test('isTutorial should return true for tutorials', () => {
  expect(isTutorial(rawLessonOfType('Design Lecture'))).toBe(true);
  expect(isTutorial(rawLessonOfType('Laboratory'))).toBe(true);
  expect(isTutorial(rawLessonOfType('Recitation'))).toBe(true);
  expect(isTutorial(rawLessonOfType('Tutorial'))).toBe(true);
  expect(isTutorial(rawLessonOfType('Tutorial Type 2'))).toBe(true);
  expect(isTutorial(rawLessonOfType('Tutorial Type 3'))).toBe(true);
  expect(isTutorial(rawLessonOfType('Lecture'))).toBe(false);
});

test('datesForAcademicWeeks should return correct dates', () => {
  expect(datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 1)).toEqual(new Date('2016-08-10T10:00+0800'));

  expect(datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 3)).toEqual(new Date('2016-08-24T10:00+0800'));

  // recess week
  expect(datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), RECESS_WEEK)).toEqual(new Date('2016-09-21T10:00+0800'));

  // week 7 is after recess week, so it is 8 weeks after the start
  expect(datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 7)).toEqual(new Date('2016-09-28T10:00+0800'));
});

test('daysAfter should create a date days after', () => {
  expect(daysAfter(new Date('2016-11-23T09:00+0800'), 1)).toEqual(new Date('2016-11-24T09:00+0800'));
});

test('iCalEventForExam should generate event', () => {
  const actual: ?EventOption = iCalEventForExam(cs1010s, 1);
  const expected: EventOption = {
    start: new Date('2016-11-23T09:00+0800'),
    end: new Date('2016-11-23T11:00+0800'),
    summary: 'CS1010S Exam',
    description: 'Programming Methodology',
    url: 'http://www.nus.edu.sg/registrar/event/examschedule-sem1.html',
  };
  expect(actual).toEqual(expected);
});

test('iCalEventForLesson generates exclusion for comma separated weeks', () => {
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
  expect(actual).toEqual(expected);
});

test('icalForTimetable', () => {
  const moduleData = {
    CS1010S: cs1010s,
    CS3216: cs3216,
  };
  const actual = iCalForTimetable(1, mockTimetable, moduleData);
  // 5 lesson types for cs1010s, 1 for cs3216, 1 exam for cs1010s
  expect(actual.length === 7).toBe(true);
});
