// @flow
import type {
  LessonConfig,
  SemTimetableConfig,
  TimetableDayFormat,
  TimetableDayArrangement,
  TimetableArrangement,
} from 'types/timetable';
import type {
  ClassNo,
  DayText,
  Lesson,
  LessonTime,
  LessonType,
  Semester,
} from 'types/modules';

import test from 'ava';
import _ from 'lodash';
import {
  randomLessonConfig,
  lessonsForLessonType,
  timetableLessonsArray,
  groupLessonsByDay,
  doLessonsOverlap,
  arrangeLessonsWithinDay,
  arrangeLessonsForWeek,
  areOtherClassesAvailable,
} from 'utils/timetable';
import {
  getModuleTimetable,
} from 'utils/modules';

import cs1010s from '../mocks/modules/CS1010S.json';
import cs3216 from '../mocks/modules/CS3216.json';
import timetable from '../mocks/sem-timetable.json';
import lessonsArray from '../mocks/lessons-array.json';

// A generic lesson with some default.
function createGenericLesson(dayText: DayText, startTime: LessonTime,
                            endTime: LessonTime, lessonType?: LessonType, classNo?: ClassNo): Lesson {
  return {
    ClassNo: classNo || "1",
    LessonType: lessonType || "Recitation",
    WeekText: "Every Week",
    Venue: "VCRm",
    DayText: dayText,
    StartTime: startTime,
    EndTime: endTime,
  };
}

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
  t.is(lessons.length, 0);
  t.deepEqual(lessons, []);
});

test('timetableLessonsArray should return a flat array of lessons', (t) => {
  const someTimetable: SemTimetableConfig = timetable;
  const lessons: Array<Lesson> = timetableLessonsArray(someTimetable);
  t.is(lessons.length, 6);
});

test('groupLessonsByDay should group lessons by DayText', (t) => {
  const lessons: Array<Lesson> = lessonsArray;
  const lessonsGroupedByDay: TimetableDayFormat = groupLessonsByDay(lessons);
  t.is(lessonsGroupedByDay.Monday.length, 2);
  t.is(lessonsGroupedByDay.Tuesday.length, 1);
  t.is(lessonsGroupedByDay.Wednesday.length, 1);
  t.is(lessonsGroupedByDay.Thursday.length, 2);
});

test('doLessonsOverlap should correctly determine if two lessons overlap', (t) => {
  // Same day same time.
  t.true(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Wednesday', '1000', '1200')));
  // Same day with no overlapping time.
  t.false(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Wednesday', '1200', '1400')));
  t.false(doLessonsOverlap(createGenericLesson('Wednesday', '1200', '1400'),
                          createGenericLesson('Wednesday', '1000', '1200')));
  // Same day with overlapping time.
  t.true(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Wednesday', '1100', '1300')));
  t.true(doLessonsOverlap(createGenericLesson('Wednesday', '1100', '1300'),
                          createGenericLesson('Wednesday', '1000', '1200')));
  // Same day with one lesson totally within another lesson.
  t.true(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Wednesday', '0900', '1300')));
  t.true(doLessonsOverlap(createGenericLesson('Wednesday', '0900', '1300'),
                          createGenericLesson('Wednesday', '1000', '1200')));
  // Different day same time.
  t.false(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Thursday', '1000', '1200')));
  // Different day with no overlapping time.
  t.false(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Thursday', '1200', '1400')));
  t.false(doLessonsOverlap(createGenericLesson('Wednesday', '1200', '1400'),
                          createGenericLesson('Thursday', '1000', '1200')));
  // Different day with overlapping time.
  t.false(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Thursday', '1100', '1300')));
  t.false(doLessonsOverlap(createGenericLesson('Wednesday', '1100', '1300'),
                          createGenericLesson('Thursday', '1000', '1200')));
  // Different day with one lesson totally within another lesson.
  t.false(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Thursday', '0900', '1300')));
  t.false(doLessonsOverlap(createGenericLesson('Wednesday', '0900', '1300'),
                          createGenericLesson('Thursday', '1000', '1200')));
});

test('arrangeLessonsWithinDay', (t) => {
  // Empty array.
  const arrangement0: TimetableDayArrangement = arrangeLessonsWithinDay([]);
  t.is(arrangement0.length, 1);

  // Can fit within one row.
  const arrangement1: TimetableDayArrangement = arrangeLessonsWithinDay(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Monday', '1400', '1500'),
  ]));
  t.is(arrangement1.length, 1);

  // Two rows.
  const arrangement2: TimetableDayArrangement = arrangeLessonsWithinDay(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Monday', '1500', '1700'),
  ]));
  t.is(arrangement2.length, 2);

  // Three rows.
  const arrangement3: TimetableDayArrangement = arrangeLessonsWithinDay(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1100', '1300'),
    createGenericLesson('Monday', '1000', '1300'),
  ]));
  t.is(arrangement3.length, 3);
});

test('arrangeLessonsForWeek', (t) => {
  const arrangement0: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Monday', '1400', '1500'),
  ]));
  t.is(arrangement0.Monday.length, 1);

  const arrangement1: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Monday', '1400', '1500'),
    createGenericLesson('Tuesday', '1400', '1500'),
    createGenericLesson('Tuesday', '1400', '1500'),
  ]));
  t.is(arrangement1.Monday.length, 1);
  t.is(arrangement1.Tuesday.length, 2);

  const arrangement2: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Monday', '1400', '1500'),
    createGenericLesson('Tuesday', '1400', '1500'),
    createGenericLesson('Tuesday', '1600', '1800'),
  ]));
  t.is(arrangement2.Monday.length, 1);
  t.is(arrangement2.Tuesday.length, 1);

  const arrangement3: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Tuesday', '1100', '1300'),
    createGenericLesson('Wednesday', '1000', '1300'),
  ]));
  t.is(arrangement3.Monday.length, 1);
  t.is(arrangement3.Tuesday.length, 1);
  t.is(arrangement3.Wednesday.length, 1);

  const arrangement4: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Tuesday', '1100', '1300'),
    createGenericLesson('Wednesday', '1000', '1300'),
  ]));
  t.is(arrangement4.Monday.length, 1);
  t.is(arrangement4.Tuesday.length, 1);
  t.is(arrangement4.Wednesday.length, 1);

  const arrangement5: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Tuesday', '1100', '1300'),
    createGenericLesson('Tuesday', '1200', '1400'),
    createGenericLesson('Wednesday', '1000', '1300'),
    createGenericLesson('Wednesday', '1100', '1400'),
  ]));
  t.is(arrangement5.Monday.length, 1);
  t.is(arrangement5.Tuesday.length, 2);
  t.is(arrangement5.Wednesday.length, 2);
});

test('areOtherClassesAvailable', (t) => {
  // Lessons belong to different ClassNo.
  const lessons1: Array<Lesson> = _.shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '2'),
    createGenericLesson('Monday', '1400', '1500', 'Lecture', '3'),
  ]);
  t.true(areOtherClassesAvailable(lessons1, 'Lecture'));
  t.false(areOtherClassesAvailable(lessons1, 'Tutorial'));

  // Lessons belong to the same ClassNo.
  const lessons2: Array<Lesson> =  _.shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '1'),
    createGenericLesson('Monday', '1400', '1500', 'Lecture', '1'),
  ]);
  t.false(areOtherClassesAvailable(lessons2, 'Lecture'));

  // Lessons belong to different LessonType.
  const lessons3: Array<Lesson> =  _.shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '1'),
    createGenericLesson('Monday', '1400', '1500', 'Tutorial', '1'),
    createGenericLesson('Monday', '1400', '1500', 'Tutorial', '2'),
  ]);
  t.false(areOtherClassesAvailable(lessons3, 'Lecture'));
  t.true(areOtherClassesAvailable(lessons3, 'Tutorial'));
});
