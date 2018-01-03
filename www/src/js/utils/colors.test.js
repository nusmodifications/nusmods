// @flow
import { range, without, uniq } from 'lodash';

import type { ColorIndex } from 'types/reducers';
import type { Lesson } from 'types/modules';

import { NUM_DIFFERENT_COLORS, getNewColor, colorLessonsByKey, fillColorMapping } from './colors';

describe('#getNewColor()', () => {
  test('it should get color without randomization', () => {
    // When there are no current colors
    expect(getNewColor([], false)).toBe(0);
    // When there are colors that have not been picked
    expect(getNewColor([0, 1], false)).toBe(2);
    // When all the colors have been picked once
    expect(getNewColor(range(NUM_DIFFERENT_COLORS), false)).toBe(0);
    // When all the colors have been picked once or more
    expect(getNewColor([...range(NUM_DIFFERENT_COLORS), 0, 1], false)).toBe(2);
  });

  test('it should get random color', () => {
    // We're not actually testing randomness, only that the color indices returned are valid
    // Check that calling getNewColor with currentColors returns an int
    // in [0, NUM_DIFFERENT_COLORS] AND not in unexpectedColors
    function expectValidIndex(
      unexpectedColors: Array<ColorIndex>,
      currentColors: Array<ColorIndex>,
    ) {
      expect(without(range(NUM_DIFFERENT_COLORS), ...unexpectedColors)).toContain(
        getNewColor(currentColors, true),
      );
    }

    range(100).forEach(() => {
      // When there are no current colors
      expectValidIndex([], []);
      // When there are colors that have not been picked
      expectValidIndex([5, 3], [5, 3]);
      // When all the colors have been picked once
      expectValidIndex([], range(NUM_DIFFERENT_COLORS));
      // When all the colors have been picked once or more
      expectValidIndex([5, 3], [...range(NUM_DIFFERENT_COLORS), 5, 3]);
    });
  });
});

describe('#colorLessonsByKey()', () => {
  const bareLesson: Lesson = {
    ClassNo: '',
    DayText: '',
    EndTime: '',
    LessonType: '',
    StartTime: '',
    Venue: '',
    WeekText: '',
    ModuleCode: '',
    ModuleTitle: '',
  };

  test('it should assign colors deterministically', () => {
    const lessons: Lesson[] = [];
    range(100).forEach((i) => {
      // Add 2 lessons for this ith venue
      const newLesson = { ...bareLesson, Venue: `LT${i}` };
      lessons.push(newLesson);
      lessons.push(newLesson);

      const coloredLessons = colorLessonsByKey(lessons, 'Venue');
      const coloredLesson = coloredLessons[coloredLessons.length - 1];

      expect(coloredLesson).toMatchObject(newLesson); // Ensure that existing lesson info wasn't modified
      expect(coloredLesson).toHaveProperty('colorIndex', i % NUM_DIFFERENT_COLORS);
    });
  });
});

describe('fillColorMapping', () => {
  test('should return color map with colors for all modules', () => {
    expect(Object.keys(fillColorMapping({ CS1010S: {}, CS3216: {} }, {}))).toEqual([
      'CS1010S',
      'CS3216',
    ]);

    expect(fillColorMapping({ CS1010S: {}, CS3216: {} }, { CS1010S: 0, CS3216: 1 })).toEqual({
      CS1010S: 0,
      CS3216: 1,
    });

    expect(
      fillColorMapping(
        { CS1010S: {}, CS3216: {} },
        { CS1010S: 0, CS3216: 1, CS1101S: 1, CS2105: 0, CS1231: 2 },
      ),
    ).toEqual({
      CS1010S: 0,
      CS3216: 1,
    });

    expect(fillColorMapping({ CS1010S: {}, CS3216: {} }, { CS1010S: 0, CS3216: 0 })).toEqual({
      CS1010S: 0,
      CS3216: 0,
    });
  });

  test('should not repeat colors unnecessarily', () => {
    const FILLED_TIMETABLE = {
      CS1010S: {},
      CS2105: {},
      CS3216: {},
      CS1101S: {},
      CS2104: {},
      CS2100: {},
      CS2107: {},
      CS4257: {},
    };

    const uniqueColors = (timetable, colors) =>
      uniq(Object.values(fillColorMapping(timetable, colors)));

    expect(uniqueColors(FILLED_TIMETABLE, {})).toHaveLength(8);
    expect(uniqueColors(FILLED_TIMETABLE, { CS3216: 1, CS1101S: 0 })).toHaveLength(8);
    expect(
      uniqueColors(
        {
          ...FILLED_TIMETABLE,
          CS1231: {},
        },
        { CS3216: 2, CS1231: 2, CS1101S: 2 },
      ),
    ).toHaveLength(7);
  });
});
