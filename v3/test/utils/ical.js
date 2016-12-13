// @flow
import test from 'ava';

import type { IcalEvent } from 'types/ical';
import type { LessonType, RawLesson } from 'types/modules';
import {
  iCalForTimetable,
  datesForAcademicWeeks,
  daysAfter,
  examIcalEvent,
  isTutorial,
} from 'utils/ical';

import cs1010s from '../mocks/modules/CS1010S.json';
import pc1222 from '../mocks/modules/PC1222.json';
import mockTimetable from '../mocks/sem-timetable.json';

const rawLesson = (lessonType: LessonType) : RawLesson => (
  {
    ClassNo: '1',
    DayText: 'Monday',
    EndTime: '1600',
    LessonType: lessonType,
    StartTime: '1400',
    Venue: 'SR1',
    WeekText: 'Every Week',
  }
)

test('isTutorial should return true for tutorials', (t) => {
  t.true(isTutorial(rawLesson('Design Lecture')));
  t.true(isTutorial(rawLesson('Laboratory')));
  t.true(isTutorial(rawLesson('Recitation')));
  t.true(isTutorial(rawLesson('Tutorial')));
  t.true(isTutorial(rawLesson('Tutorial Type 2')));
  t.true(isTutorial(rawLesson('Tutorial Type 3')));
  t.false(isTutorial(rawLesson('Lecture')));
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

test('icalForTimetable', (t) => {
  const moduleData = {
    'CS1010S': cs1010s,
    'PC1222': pc1222,
  }
  const actual = iCalForTimetable(1, mockTimetable, moduleData);
  t.true(actual.length === 2);
})
