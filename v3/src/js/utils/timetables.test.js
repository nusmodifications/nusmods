// @flow

import _ from 'lodash';

import type {
  ModuleLessonConfig,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TimetableArrangement,
  TimetableDayArrangement,
  TimetableDayFormat,
} from 'types/timetables';
import type {
  ClassNo,
  DayText,
  Lesson,
  LessonTime,
  LessonType,
  ModuleCode,
  RawLesson,
  Semester,
} from 'types/modules';
import type { ModulesMap } from 'reducers/entities/moduleBank';

import {
  areOtherClassesAvailable,
  arrangeLessonsForWeek,
  arrangeLessonsWithinDay,
  doLessonsOverlap,
  groupLessonsByDay,
  hydrateSemTimetableWithLessons,
  lessonsForLessonType,
  randomModuleLessonConfig,
  timetableLessonsArray,
} from 'utils/timetables';
import {
  getModuleTimetable,
} from 'utils/modules';

import cs1010s from '__mocks__/modules/CS1010S.json';
import timetable from '__mocks__/sem-timetable.json';
import lessonsArray from '__mocks__/lessons-array.json';

// A generic lesson with some default.
/* eslint-disable import/prefer-default-export */
export function createGenericLesson(dayText: DayText, startTime: LessonTime,
  endTime: LessonTime, lessonType?: LessonType, classNo?: ClassNo): Lesson {
  return {
    ModuleCode: 'GC1101',
    ModuleTitle: 'Generic Title',
    ClassNo: classNo || '1',
    LessonType: lessonType || 'Recitation',
    WeekText: 'Every Week',
    Venue: 'VCRm',
    DayText: dayText,
    StartTime: startTime,
    EndTime: endTime,
  };
}

test('randomModuleLessonConfig should return a random lesson config', () => {
  const sem: Semester = 1;
  const rawLessons: Array<RawLesson> = getModuleTimetable(cs1010s, sem);
  const lessonConfig: ModuleLessonConfig = randomModuleLessonConfig(rawLessons);
  Object.keys(lessonConfig).forEach((lessonType: LessonType) => {
    expect(lessonConfig[lessonType]).toBeTruthy();
  });
});

test('hydrateSemTimetableWithLessons should replace ClassNo with lessons', () => {
  const sem: Semester = 1;
  const moduleCode: ModuleCode = 'CS1010S';
  const modules: ModulesMap = {
    [moduleCode]: cs1010s,
  };
  const tutorialClassNo: ClassNo = '8';
  const recitationClassNo: ClassNo = '4';
  const lectureClassNo: ClassNo = '1';
  const config: SemTimetableConfig = {
    [moduleCode]: {
      Tutorial: '8',
      Recitation: '4',
      Lecture: '1',
    },
  };
  const configWithLessons: SemTimetableConfigWithLessons = hydrateSemTimetableWithLessons(config, modules, sem);
  expect(configWithLessons[moduleCode].Tutorial[0].ClassNo).toBe(tutorialClassNo);
  expect(configWithLessons[moduleCode].Recitation[0].ClassNo).toBe(recitationClassNo);
  expect(configWithLessons[moduleCode].Lecture[0].ClassNo).toBe(lectureClassNo);
});

test('lessonsForLessonType should return all lessons belonging to a particular LessonType', () => {
  const sem: Semester = 1;
  const moduleTimetable: Array<RawLesson> = getModuleTimetable(cs1010s, sem);
  const lessonType: LessonType = 'Tutorial';
  const lessons: Array<RawLesson> = lessonsForLessonType(moduleTimetable, lessonType);
  expect(lessons.length > 0).toBe(true);
  lessons.forEach((lesson: RawLesson) => {
    expect(lesson.LessonType).toBe(lessonType);
  });
});

test('lessonsForLessonType should return empty array if no such LessonType is present', () => {
  const sem: Semester = 1;
  const moduleTimetable: Array<RawLesson> = getModuleTimetable(cs1010s, sem);
  const lessonType: LessonType = 'Dota Session';
  const lessons: Array<RawLesson> = lessonsForLessonType(moduleTimetable, lessonType);
  expect(lessons.length).toBe(0);
  expect(lessons).toEqual([]);
});

test('timetableLessonsArray should return a flat array of lessons', () => {
  const someTimetable: SemTimetableConfig = timetable;
  const lessons: Array<Lesson> = timetableLessonsArray(someTimetable);
  expect(lessons.length).toBe(6);
});

test('groupLessonsByDay should group lessons by DayText', () => {
  const lessons: Array<Lesson> = lessonsArray;
  const lessonsGroupedByDay: TimetableDayFormat = groupLessonsByDay(lessons);
  expect(lessonsGroupedByDay.Monday.length).toBe(2);
  expect(lessonsGroupedByDay.Tuesday.length).toBe(1);
  expect(lessonsGroupedByDay.Wednesday.length).toBe(1);
  expect(lessonsGroupedByDay.Thursday.length).toBe(2);
});

test('doLessonsOverlap should correctly determine if two lessons overlap', () => {
  // Same day same time.
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Wednesday', '1000', '1200'))).toBe(true);
  // Same day with no overlapping time.
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Wednesday', '1200', '1400'))).toBe(false);
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1200', '1400'),
                          createGenericLesson('Wednesday', '1000', '1200'))).toBe(false);
  // Same day with overlapping time.
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Wednesday', '1100', '1300'))).toBe(true);
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1100', '1300'),
                          createGenericLesson('Wednesday', '1000', '1200'))).toBe(true);
  // Same day with one lesson totally within another lesson.
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Wednesday', '0900', '1300'))).toBe(true);
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '0900', '1300'),
                          createGenericLesson('Wednesday', '1000', '1200'))).toBe(true);
  // Different day same time.
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Thursday', '1000', '1200'))).toBe(false);
  // Different day with no overlapping time.
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Thursday', '1200', '1400'))).toBe(false);
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1200', '1400'),
                          createGenericLesson('Thursday', '1000', '1200'))).toBe(false);
  // Different day with overlapping time.
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Thursday', '1100', '1300'))).toBe(false);
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1100', '1300'),
                          createGenericLesson('Thursday', '1000', '1200'))).toBe(false);
  // Different day with one lesson totally within another lesson.
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '1000', '1200'),
                          createGenericLesson('Thursday', '0900', '1300'))).toBe(false);
  expect(doLessonsOverlap(createGenericLesson('Wednesday', '0900', '1300'),
                          createGenericLesson('Thursday', '1000', '1200'))).toBe(false);
});

test('arrangeLessonsWithinDay', () => {
  // Empty array.
  const arrangement0: TimetableDayArrangement = arrangeLessonsWithinDay([]);
  expect(arrangement0.length).toBe(1);

  // Can fit within one row.
  const arrangement1: TimetableDayArrangement = arrangeLessonsWithinDay(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Monday', '1400', '1500'),
  ]));
  expect(arrangement1.length).toBe(1);

  // Two rows.
  const arrangement2: TimetableDayArrangement = arrangeLessonsWithinDay(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Monday', '1500', '1700'),
  ]));
  expect(arrangement2.length).toBe(2);

  // Three rows.
  const arrangement3: TimetableDayArrangement = arrangeLessonsWithinDay(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1100', '1300'),
    createGenericLesson('Monday', '1000', '1300'),
  ]));
  expect(arrangement3.length).toBe(3);
});

test('arrangeLessonsForWeek', () => {
  const arrangement0: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Monday', '1400', '1500'),
  ]));
  expect(arrangement0.Monday.length).toBe(1);

  const arrangement1: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Monday', '1400', '1500'),
    createGenericLesson('Tuesday', '1400', '1500'),
    createGenericLesson('Tuesday', '1400', '1500'),
  ]));
  expect(arrangement1.Monday.length).toBe(1);
  expect(arrangement1.Tuesday.length).toBe(2);

  const arrangement2: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Monday', '1400', '1500'),
    createGenericLesson('Tuesday', '1400', '1500'),
    createGenericLesson('Tuesday', '1600', '1800'),
  ]));
  expect(arrangement2.Monday.length).toBe(1);
  expect(arrangement2.Tuesday.length).toBe(1);

  const arrangement3: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Tuesday', '1100', '1300'),
    createGenericLesson('Wednesday', '1000', '1300'),
  ]));
  expect(arrangement3.Monday.length).toBe(1);
  expect(arrangement3.Tuesday.length).toBe(1);
  expect(arrangement3.Wednesday.length).toBe(1);

  const arrangement4: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Tuesday', '1100', '1300'),
    createGenericLesson('Wednesday', '1000', '1300'),
  ]));
  expect(arrangement4.Monday.length).toBe(1);
  expect(arrangement4.Tuesday.length).toBe(1);
  expect(arrangement4.Wednesday.length).toBe(1);

  const arrangement5: TimetableArrangement = arrangeLessonsForWeek(_.shuffle([
    createGenericLesson('Monday', '1000', '1200'),
    createGenericLesson('Monday', '1600', '1800'),
    createGenericLesson('Tuesday', '1100', '1300'),
    createGenericLesson('Tuesday', '1200', '1400'),
    createGenericLesson('Wednesday', '1000', '1300'),
    createGenericLesson('Wednesday', '1100', '1400'),
  ]));
  expect(arrangement5.Monday.length).toBe(1);
  expect(arrangement5.Tuesday.length).toBe(2);
  expect(arrangement5.Wednesday.length).toBe(2);
});

test('areOtherClassesAvailable', () => {
  // Lessons belong to different ClassNo.
  const lessons1: Array<RawLesson> = _.shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '2'),
    createGenericLesson('Monday', '1400', '1500', 'Lecture', '3'),
  ]);
  expect(areOtherClassesAvailable(lessons1, 'Lecture')).toBe(true);
  expect(areOtherClassesAvailable(lessons1, 'Tutorial')).toBe(false);

  // Lessons belong to the same ClassNo.
  const lessons2: Array<RawLesson> = _.shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '1'),
    createGenericLesson('Monday', '1400', '1500', 'Lecture', '1'),
  ]);
  expect(areOtherClassesAvailable(lessons2, 'Lecture')).toBe(false);

  // Lessons belong to different LessonType.
  const lessons3: Array<RawLesson> = _.shuffle([
    createGenericLesson('Monday', '1000', '1200', 'Lecture', '1'),
    createGenericLesson('Monday', '1600', '1800', 'Lecture', '1'),
    createGenericLesson('Monday', '1400', '1500', 'Tutorial', '1'),
    createGenericLesson('Monday', '1400', '1500', 'Tutorial', '2'),
  ]);
  expect(areOtherClassesAvailable(lessons3, 'Lecture')).toBe(false);
  expect(areOtherClassesAvailable(lessons3, 'Tutorial')).toBe(true);
});
