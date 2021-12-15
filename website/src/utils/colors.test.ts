import { range, uniq, without } from 'lodash';

import { ColorMapping } from 'types/reducers';
import { ColorIndex, Lesson, SemTimetableConfig } from 'types/timetables';

import { colorLessonsByKey, fillColorMapping, getNewColor, NUM_DIFFERENT_COLORS } from './colors';

describe(getNewColor, () => {
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
    function expectValidIndex(unexpectedColors: ColorIndex[], currentColors: ColorIndex[]) {
      expect(without(range(NUM_DIFFERENT_COLORS), ...unexpectedColors)).toContain(
        getNewColor(currentColors, true),
      );
    }

    range(NUM_DIFFERENT_COLORS * 5).forEach(() => {
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

describe(colorLessonsByKey, () => {
  const bareLesson: Omit<Lesson, 'venue'> = {
    classNo: '',
    day: 'Monday',
    endTime: '',
    lessonType: '',
    startTime: '',
    weeks: [],
    moduleCode: '',
    title: '',
  };

  test('it should assign colors deterministically', () => {
    const lessons: Lesson[] = [];
    range(NUM_DIFFERENT_COLORS).forEach((i) => {
      // Add 2 lessons for this ith venue
      const newLesson = { ...bareLesson, venue: `LT${i}` };
      lessons.push(newLesson);
      lessons.push(newLesson);
    });

    const coloredLessons = colorLessonsByKey(lessons, 'venue');

    range(NUM_DIFFERENT_COLORS * 2).forEach((i) => {
      const coloredLesson = coloredLessons[i];
      const index = Math.floor(i / 2);
      expect(coloredLesson).toMatchObject(bareLesson); // Ensure that existing lesson info wasn't modified
      expect(coloredLesson).toHaveProperty('venue', `LT${index}`);
      expect(coloredLesson).toHaveProperty('colorIndex', index % NUM_DIFFERENT_COLORS);
    });
  });
});

describe(fillColorMapping, () => {
  test('should return color map with colors for all modules', () => {
    expect(Object.keys(fillColorMapping({ CS1010S: {}, CS3216: {} }, {}, []))).toEqual([
      'CS1010S',
      'CS3216',
    ]);

    expect(fillColorMapping({ CS1010S: {}, CS3216: {} }, { CS1010S: 0, CS3216: 1 }, [])).toEqual({
      CS1010S: 0,
      CS3216: 1,
    });

    expect(
      fillColorMapping(
        { CS1010S: {}, CS3216: {} },
        { CS1010S: 0, CS3216: 1, CS1101S: 1, CS2105: 0, CS1231: 2 },
        [], 
      ),
    ).toEqual({
      CS1010S: 0,
      CS3216: 1,
    });

    expect(fillColorMapping({ CS1010S: {}, CS3216: {} }, { CS1010S: 0, CS3216: 0 }, [])).toEqual({
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

    const uniqueColors = (timetable: SemTimetableConfig, colors: ColorMapping) =>
      uniq(Object.values(fillColorMapping(timetable, colors, [])));

    expect(uniqueColors(FILLED_TIMETABLE, {})).toHaveLength(8);
    expect(uniqueColors(FILLED_TIMETABLE, { CS3216: 1, CS1101S: 0 })).toHaveLength(8);
    expect(
      uniqueColors({ ...FILLED_TIMETABLE, CS1231: {} }, { CS3216: 2, CS1231: 2, CS1101S: 2 }),
    ).toHaveLength(7);
  });
});
