import NUSModerator from 'nusmoderator';
import { parseISO } from 'date-fns';
import { ModuleLessonConfig } from 'types/timetables';
import { LessonType, ModuleLessonMap, RawLesson, Semester, Weeks } from 'types/modules';

import { getModuleLessonMap, getModuleTimetable } from 'utils/modules';

import { CS1010S } from '__mocks__/modules';
import timetable from '__mocks__/sem-timetable.json';

import { createGenericLesson, EVEN_WEEK, EVERY_WEEK, ODD_WEEK } from 'test-utils/timetable';

import {
  formatNumericWeeks,
  getEndTimeAsDate,
  getStartTimeAsDate,
  isLessonAvailable,
  isLessonOngoing,
  isValidSemester,
  lessonsForLessonType,
  randomModuleLessonConfig,
  timetableLessonsArray,
} from '.';

describe(isValidSemester, () => {
  test('semesters 1-4 are valid', () => {
    expect(isValidSemester(1)).toBe(true);
    expect(isValidSemester(2)).toBe(true);
    expect(isValidSemester(3)).toBe(true);
    expect(isValidSemester(4)).toBe(true);
  });

  test('non 1-4 are invalid', () => {
    expect(isValidSemester(0)).toBe(false);
    expect(isValidSemester(5)).toBe(false);
  });
});

test('randomModuleLessonConfig should return a random lesson config', () => {
  const sem: Semester = 1;
  const rawLessons: ModuleLessonMap<RawLesson> = getModuleLessonMap(CS1010S, sem);
  const lessonConfig: ModuleLessonConfig = randomModuleLessonConfig(rawLessons);
  Object.keys(lessonConfig).forEach((lessonType: LessonType) => {
    expect(lessonConfig[lessonType]).toBeTruthy();
  });
});

test('lessonsForLessonType should return all lessons belonging to a particular lessonType', () => {
  const sem: Semester = 1;
  const moduleTimetable = getModuleTimetable(CS1010S, sem);
  const lessonType = 'Tutorial';
  const lessons = lessonsForLessonType(moduleTimetable, lessonType);
  expect(lessons.length > 0).toBe(true);
  lessons.forEach((lesson: RawLesson) => {
    expect(lesson.lessonType).toBe(lessonType);
  });
});

test('lessonsForLessonType should return empty array if no such lessonType is present', () => {
  const sem: Semester = 1;
  const moduleTimetable = getModuleTimetable(CS1010S, sem);
  const lessons = lessonsForLessonType(moduleTimetable, 'Dota Session');
  expect(lessons.length).toBe(0);
  expect(lessons).toEqual([]);
});

test('timetableLessonsArray should return a flat array of lessons', () => {
  const someTimetable = timetable;
  expect(timetableLessonsArray(someTimetable).length).toBe(6);
});

describe(formatNumericWeeks, () => {
  it('should return null if every week is given', () => {
    expect(formatNumericWeeks(EVERY_WEEK)).toBeNull();
  });

  it('should return even/odd weeks', () => {
    expect(formatNumericWeeks(ODD_WEEK)).toEqual('Odd Weeks');
    expect(formatNumericWeeks(EVEN_WEEK)).toEqual('Even Weeks');
  });

  it('should abbreviate consecutive week numbers', () => {
    expect(formatNumericWeeks([1])).toEqual('Week 1');
    expect(formatNumericWeeks([1, 2, 3, 4])).toEqual('Weeks 1-4');
    expect(formatNumericWeeks([1, 2, 3, 4, 6, 7, 8, 9])).toEqual('Weeks 1-4, 6-9');
    expect(formatNumericWeeks([1, 3, 5])).toEqual('Weeks 1, 3, 5');
    expect(formatNumericWeeks([1, 2, 4, 5, 6, 7])).toEqual('Weeks 1, 2, 4-7');
    expect(formatNumericWeeks([1, 2, 4, 5])).toEqual('Weeks 1, 2, 4, 5');
  });
});

describe(isLessonAvailable, () => {
  function testLessonAvailable(weeks: Weeks, date: Date) {
    return isLessonAvailable(
      { ...createGenericLesson(), weeks },
      date,
      NUSModerator.academicCalendar.getAcadWeekInfo(date),
    );
  }

  test("should return false if the lesson's Weeks does not match the week number", () => {
    expect(
      testLessonAvailable(
        [1, 3, 5, 7, 9, 11],
        // Week 5
        parseISO('2017-09-11'),
      ),
    ).toBe(true);

    expect(
      testLessonAvailable(
        [1, 2, 3],
        // Week 4
        parseISO('2017-09-04'),
      ),
    ).toBe(false);

    expect(
      testLessonAvailable(
        [1, 3, 5, 7, 9, 11],
        // Week 5
        parseISO('2017-09-11'),
      ),
    ).toBe(true);
  });

  test('should return false if the date falls outside the week range', () => {
    expect(
      testLessonAvailable(
        { start: '2017-08-07', end: '2017-10-17' },
        // Week 5
        parseISO('2017-09-11'),
      ),
    ).toBe(true);
  });
});

describe(isLessonOngoing, () => {
  test('should return whether a lesson is ongoing', () => {
    const lesson = createGenericLesson();
    expect(isLessonOngoing(lesson, 759)).toBe(false);
    expect(isLessonOngoing(lesson, 800)).toBe(true);
    expect(isLessonOngoing(lesson, 805)).toBe(true);
    expect(isLessonOngoing(lesson, 959)).toBe(true);
    expect(isLessonOngoing(lesson, 1000)).toBe(false);
  });
});

describe(getStartTimeAsDate, () => {
  test('should return start time as date', () => {
    const date = new Date(2018, 5, 10);
    const lesson = createGenericLesson('Monday', '0830', '1045');
    expect(getStartTimeAsDate(lesson, date)).toEqual(new Date(2018, 5, 10, 8, 30));
  });
});

describe(getEndTimeAsDate, () => {
  test('should return end time as date', () => {
    const date = new Date(2018, 5, 10);
    const lesson = createGenericLesson('Monday', '0830', '1045');
    expect(getEndTimeAsDate(lesson, date)).toEqual(new Date(2018, 5, 10, 10, 45));
  });
});
