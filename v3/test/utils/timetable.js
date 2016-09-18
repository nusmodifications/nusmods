// @flow
import type {
  LessonConfig,
  SemTimetableConfig,
  TimetableDayFormat,
  TimetableDayArrangement,
  TimetableArrangement,
} from 'types/timetable';
import type {
  Lesson,
  LessonType,
  Semester,
  TimetableLesson,
} from 'types/modules';

import test from 'ava';
import {
  randomLessonConfig,
  lessonsForLessonType,
} from 'utils/timetable';
import {
  getModuleTimetable,
} from 'utils/modules';

import cs1010s from '../mocks/modules/CS1010S.json';
import cs3216 from '../mocks/modules/CS3216.json';

test('randomLessonConfig should return a random lesson config', (t) => {
  const sem: Semester = 1;
  const lessonConfig: LessonConfig = randomLessonConfig(getModuleTimetable(cs1010s, sem));
  Object.keys(lessonConfig).forEach((lessonType: LessonType) => {
    const lessons: Array<Lesson> = lessonConfig[lessonType];
    t.true(lessons.length > 0);
  });
});

test('lessonsForLessonType should return all lessons belonging to a particular LessonType', (t) => {
  const sem: Semester = 1;
  const moduleTimetable: Array<Lesson> = getModuleTimetable(cs1010s, sem);
  const lessonType: LessonType = 'Tutorial';
  const lessons: Array<Lesson> = lessonsForLessonType(moduleTimetable, lessonType);
  t.true(lessons.length > 0);
  lessons.forEach((lesson: Lesson) => {
    t.is(lesson.LessonType, lessonType);
  });
});

test('lessonsForLessonType should return empty array if no such LessonType is present', (t) => {
  const sem: Semester = 1;
  const moduleTimetable: Array<Lesson> = getModuleTimetable(cs1010s, sem);
  const lessonType: LessonType = 'Dota Session';
  const lessons: Array<Lesson> = lessonsForLessonType(moduleTimetable, lessonType);
  t.true(lessons.length === 0);
  t.deepEqual(lessons, []);
});
