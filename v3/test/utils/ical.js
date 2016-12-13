// @flow
import test from 'ava';

import { IcalEvent } from 'types/ical';
import {
  icalForTimetable,
  iCalEventsForLesson,
  datesForAcademicWeeks,
  daysAfter,
  examIcalEvent,
  isTutorial,
} from 'utils/ical';

import cs1010s from '../mocks/modules/CS1010S.json';
import pc1222 from '../mocks/modules/PC1222.json';

test('isTutorial should return true for tutorials', (t) => {
  t.true(isTutorial({ LessonType: 'Design Lecture' }));
  t.true(isTutorial({ LessonType: 'Laboratory' }));
  t.true(isTutorial({ LessonType: 'Recitation' }));
  t.true(isTutorial({ LessonType: 'Tutorial' }));
  t.true(isTutorial({ LessonType: 'Tutorial Type 2' }));
  t.true(isTutorial({ LessonType: 'Tutorial Type 3' }));
  t.false(isTutorial({ LessonType: 'Lecture' }));
});

test('datesForAcademicWeeks', (t) => {
  t.deepEqual(
    datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 1),
    new Date('2016-08-10T10:00+0800'))
  t.deepEqual(
    datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 3),
      new Date('2016-08-24T10:00+0800'));

  t.deepEqual(
    datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 5),
      new Date('2016-09-07T10:00+0800'));
})

test('daysAfter should create a date days after', (t) => {
  t.true(
    daysAfter(new Date('2016-11-23T09:00+0800'), 1).toString() ===
    (new Date('2016-11-24T09:00+0800')).toString()
  );
});

test('examIcalEvent should generate event', (t) => {
  const actual: IcalEvent = examIcalEvent(cs1010s, 1);
  const expected: IcalEvent = {
    start: new Date('2016-11-23T09:00+0800'),
    end: new Date('2016-11-23T11:00+0800'),
    summary: 'CS1010S Exam',
    description: 'Programming Methodology',
    url: 'http://www.nus.edu.sg/registrar/event/examschedule-sem1.html',
  };
  t.deepEqual(actual, expected);
});

test('iCalEventsForLesson should generate events', (t) => {
  const actual: IcalEvent = iCalEventsForLesson(cs1010s, 1, "Lecture", "1");
  const expected: Array<IcalEvent> = [{
    start: new Date('2016-08-10T10:00+0800'),
    end: new Date('2016-08-10T12:00+0800'),
    summary: 'CS1010S Lecture',
    description: 'Programming Methodology\nLecture Group 1',
    location: 'LT26',
    url: 'https://myaces.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?acad_y=2016/2017&sem_c=1&mod_c=CS1010S',
    repeating: {
      freq: 'WEEKLY',
      count: 14,
      byDay: ['We'],
    },
    exclude: [
      new Date('2016-09-21T10:00+0800'),
    ]
  }];
  t.deepEqual(actual, expected);
});

test('icalForTimetable', (t) => {
  const timetable = {
    'CS1010S': {
      'Lecture': '1',
    },
    'PC1222': {
      'Laboratory': 'B1',
    },
  }
  const moduleData = {
    'CS1010S': cs1010s,
    'PC1222': pc1222,
  }
  const actual = icalForTimetable(1, timetable, moduleData);
  t.true(actual.length === 2);
})
