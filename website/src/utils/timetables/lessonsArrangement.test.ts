import { shuffle } from 'lodash-es';
import {
  ColoredLesson,
  TimetableArrangement,
  TimetableDayArrangement,
  TimetableDayFormat,
} from 'types/timetables';
import { RawLesson } from 'types/modules';

import lessonsArray from '__mocks__/lessons-array.json';

import { createGenericColoredLesson, createGenericLesson } from 'test-utils/timetable';
import {
  arrangeLessonsForWeek,
  arrangeLessonsWithinDay,
  doLessonsOverlap,
  groupLessonsByDay,
} from './lessonsArrangement';

test('groupLessonsByDay should group lessons by DayText', () => {
  const lessons: ColoredLesson[] = lessonsArray;
  const lessonsGroupedByDay: TimetableDayFormat<ColoredLesson> = groupLessonsByDay(lessons);
  expect(lessonsGroupedByDay.Monday.length).toBe(2);
  expect(lessonsGroupedByDay.Tuesday.length).toBe(1);
  expect(lessonsGroupedByDay.Wednesday.length).toBe(1);
  expect(lessonsGroupedByDay.Thursday.length).toBe(2);
});

// TODO: write one for array lesson overlap
test('doLessonsOverlap should correctly determine if two lessons overlap', () => {
  // Same day same time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Wednesday', '1000', '1200'),
    ),
  ).toBe(true);
  // Same day with no overlapping time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Wednesday', '1200', '1400'),
    ),
  ).toBe(false);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1200', '1400'),
      createGenericLesson('Wednesday', '1000', '1200'),
    ),
  ).toBe(false);
  // Same day with overlapping time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Wednesday', '1100', '1300'),
    ),
  ).toBe(true);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1100', '1300'),
      createGenericLesson('Wednesday', '1000', '1200'),
    ),
  ).toBe(true);
  // Same day with one lesson totally within another lesson.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Wednesday', '0900', '1300'),
    ),
  ).toBe(true);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '0900', '1300'),
      createGenericLesson('Wednesday', '1000', '1200'),
    ),
  ).toBe(true);
  // Different day same time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Thursday', '1000', '1200'),
    ),
  ).toBe(false);
  // Different day with no overlapping time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Thursday', '1200', '1400'),
    ),
  ).toBe(false);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1200', '1400'),
      createGenericLesson('Thursday', '1000', '1200'),
    ),
  ).toBe(false);
  // Different day with overlapping time.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Thursday', '1100', '1300'),
    ),
  ).toBe(false);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1100', '1300'),
      createGenericLesson('Thursday', '1000', '1200'),
    ),
  ).toBe(false);
  // Different day with one lesson totally within another lesson.
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '1000', '1200'),
      createGenericLesson('Thursday', '0900', '1300'),
    ),
  ).toBe(false);
  expect(
    doLessonsOverlap(
      createGenericLesson('Wednesday', '0900', '1300'),
      createGenericLesson('Thursday', '1000', '1200'),
    ),
  ).toBe(false);
});

test('arrangeLessonsWithinDay', () => {
  // Empty array.
  const arrangement0: TimetableDayArrangement<RawLesson> = arrangeLessonsWithinDay([]);
  expect(arrangement0.length).toBe(1);

  // Can fit within one row.
  const arrangement1: TimetableDayArrangement<ColoredLesson> = arrangeLessonsWithinDay(
    shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1400', '1500'),
    ]),
  );
  expect(arrangement1.length).toBe(1);

  // Two rows.
  const arrangement2: TimetableDayArrangement<ColoredLesson> = arrangeLessonsWithinDay(
    shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1500', '1700'),
    ]),
  );
  expect(arrangement2.length).toBe(2);

  // Three rows.
  const arrangement3: TimetableDayArrangement<ColoredLesson> = arrangeLessonsWithinDay(
    shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1100', '1300'),
      createGenericColoredLesson('Monday', '1000', '1300'),
    ]),
  );
  expect(arrangement3.length).toBe(3);
});

test('arrangeLessonsForWeek', () => {
  const arrangement0: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
    shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1400', '1500'),
    ]),
  );
  expect(arrangement0.Monday.length).toBe(1);

  const arrangement1: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
    shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1400', '1500'),
      createGenericColoredLesson('Tuesday', '1400', '1500'),
      createGenericColoredLesson('Tuesday', '1400', '1500'),
    ]),
  );
  expect(arrangement1.Monday.length).toBe(1);
  expect(arrangement1.Tuesday.length).toBe(2);

  const arrangement2: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
    shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Monday', '1400', '1500'),
      createGenericColoredLesson('Tuesday', '1400', '1500'),
      createGenericColoredLesson('Tuesday', '1600', '1800'),
    ]),
  );
  expect(arrangement2.Monday.length).toBe(1);
  expect(arrangement2.Tuesday.length).toBe(1);

  const arrangement3: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
    shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Tuesday', '1100', '1300'),
      createGenericColoredLesson('Wednesday', '1000', '1300'),
    ]),
  );
  expect(arrangement3.Monday.length).toBe(1);
  expect(arrangement3.Tuesday.length).toBe(1);
  expect(arrangement3.Wednesday.length).toBe(1);

  const arrangement4: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
    shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Tuesday', '1100', '1300'),
      createGenericColoredLesson('Wednesday', '1000', '1300'),
    ]),
  );
  expect(arrangement4.Monday.length).toBe(1);
  expect(arrangement4.Tuesday.length).toBe(1);
  expect(arrangement4.Wednesday.length).toBe(1);

  const arrangement5: TimetableArrangement<ColoredLesson> = arrangeLessonsForWeek(
    shuffle([
      createGenericColoredLesson('Monday', '1000', '1200'),
      createGenericColoredLesson('Monday', '1600', '1800'),
      createGenericColoredLesson('Tuesday', '1100', '1300'),
      createGenericColoredLesson('Tuesday', '1200', '1400'),
      createGenericColoredLesson('Wednesday', '1000', '1300'),
      createGenericColoredLesson('Wednesday', '1100', '1400'),
    ]),
  );
  expect(arrangement5.Monday.length).toBe(1);
  expect(arrangement5.Tuesday.length).toBe(2);
  expect(arrangement5.Wednesday.length).toBe(2);
});
