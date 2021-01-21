import { ModuleCode } from '../types/modules';
import { VenueLesson } from '../types/venues';
import { EVERY_WEEK } from './test-utils';

import {
  // compareWeeks,
  getDuplicateModules,
  mergeDualCodedModules,
  removeEmptyValues,
  titleize,
  trimValues,
  decodeHTMLEntities,
  ZWSP,
} from './data';

describe(titleize, () => {
  test('should turn all upper and lowercase text into proper titles', () => {
    expect(titleize('hello world 2019')).toEqual('Hello World 2019');
    expect(titleize('HELLO WORLD 2019')).toEqual('Hello World 2019');
  });

  test('should not titlecase minor words', () => {
    expect(titleize('The ring of mordor')).toEqual('The Ring of Mordor');
  });

  test('should not change abbreviations and minor words in the middle of words', () => {
    expect(titleize('GRADUATE SEMINAR MODULE IN BIOLOGICAL SCIENCES')).toEqual(
      'Graduate Seminar Module in Biological Sciences',
    );
    expect(titleize('Quantum and Theoretical Physics')).toEqual('Quantum and Theoretical Physics');
  });

  test('should not change abbreviations', () => {
    expect(titleize('NUS world cup 2019')).toEqual('NUS World Cup 2019');
    expect(titleize('NUS-MIT lab for excellence 2019')).toEqual('NUS-MIT Lab For Excellence 2019');
  });
});

describe(decodeHTMLEntities, () => {
  test('should decode HTML entities', () => {
    expect(
      decodeHTMLEntities('&amp; Schr&#246;dinger cried, &quot;Oh l&#224; l&#224;!&quot;'),
    ).toEqual('& Schrödinger cried, "Oh là là!"');
  });
});

describe(trimValues, () => {
  test('should remove whitespace around the given values', () => {
    expect(
      trimValues(
        {
          a: '\u00A0\u202Fc\t\n',
          b: 123,
          c: 'def',
          d: null,
        },
        ['a', 'b', 'c', 'd'],
      ),
    ).toEqual({
      a: 'c',
      b: 123,
      c: 'def',
      d: null,
    });
  });

  test('should not remove whitespace for keys not given', () => {
    expect(
      trimValues(
        {
          a: ' a ',
          b: ' b ',
          c: ' c ',
        },
        ['a', 'b'],
      ),
    ).toEqual({
      a: 'a',
      b: 'b',
      c: ' c ',
    });
  });
});

describe(removeEmptyValues, () => {
  test('it should remove null and empty strings', () => {
    expect(
      removeEmptyValues(
        {
          a: null,
          b: '',
          c: 0,
          d: '    ',
          e: 12,
          f: 'x',
        },
        ['a', 'b', 'c', 'd'],
      ),
    ).toEqual({
      e: 12,
      f: 'x',
    });
  });

  test('it should not remove keys that are not in keys', () => {
    expect(
      removeEmptyValues(
        {
          a: null,
          b: '',
          c: 0,
          d: 12,
          e: 'x',
        },
        [],
      ),
    ).toEqual({
      a: null,
      b: '',
      c: 0,
      d: 12,
      e: 'x',
    });
  });

  test('it should remove nil strings', () => {
    expect(
      removeEmptyValues(
        {
          a: 'nil',
          b: 'None.',
          c: '-n/a-',
          d: 'Hello',
          e: 'x',
          f: ' ',
        },
        ['a', 'b', 'c', 'd', 'e', 'f'],
      ),
    ).toEqual({ d: 'Hello', e: 'x' });
  });
});

const EVEN_WEEK = [2, 4, 6, 8, 10, 12];
const ODD_WEEK = [1, 3, 5, 7, 9, 13];

const makeVenueLesson = (
  moduleCode: ModuleCode,
  props: Partial<VenueLesson> = {},
): VenueLesson => ({
  classNo: '1',
  day: 'Monday',
  lessonType: 'Lecture',
  endTime: '1000',
  startTime: '0900',
  weeks: EVERY_WEEK,
  size: 30,
  moduleCode,
  ...props,
});

describe(getDuplicateModules, () => {
  it('should return an array of duplicated module codes', () => {
    expect(getDuplicateModules([makeVenueLesson('GEK1901'), makeVenueLesson('GET1001')])).toEqual([
      'GEK1901',
      'GET1001',
    ]);

    expect(
      getDuplicateModules([
        makeVenueLesson('GEK1901', { weeks: ODD_WEEK }),
        makeVenueLesson('GET1001', { weeks: ODD_WEEK }),
        makeVenueLesson('GET1002', { weeks: EVEN_WEEK }),
      ]),
    ).toEqual(['GEK1901', 'GET1001']);
  });

  it('should not consider modules happening on different weeks as duplicates', () => {
    expect(
      getDuplicateModules([
        makeVenueLesson('GEK1901', { weeks: ODD_WEEK }),
        makeVenueLesson('GET1001', { weeks: EVEN_WEEK }),
      ]),
    ).toEqual([]);
  });
});

describe(mergeDualCodedModules, () => {
  it('should merge modules with the same starting time', () => {
    const { lessons, aliases } = mergeDualCodedModules([
      makeVenueLesson('GEK1901'),
      makeVenueLesson('GET1001'),
    ]);
    expect(lessons).toEqual([makeVenueLesson(`GEK1901/${ZWSP}GET1001`)]);
    expect(aliases).toEqual({
      GEK1901: new Set(['GET1001']),
      GET1001: new Set(['GEK1901']),
    });
  });

  it('should merge module sets of modules with the same starting time', () => {
    const { lessons, aliases } = mergeDualCodedModules([
      // GEK1901 and GET1001 have the same lessons
      makeVenueLesson('GEK1901', { startTime: '1000' }),
      makeVenueLesson('GEK1901', { startTime: '1400' }),
      makeVenueLesson('GET1001', { startTime: '1000' }),
      makeVenueLesson('GET1001', { startTime: '1400' }),
      // GEK1902 and GES1001 have the same lessons
      makeVenueLesson('GEK1902', { startTime: '1200' }),
      makeVenueLesson('GES1001', { startTime: '1200' }),
    ]);

    expect(lessons).toEqual([
      makeVenueLesson(`GEK1901/${ZWSP}GET1001`, { startTime: '1000' }),
      makeVenueLesson(`GEK1901/${ZWSP}GET1001`, { startTime: '1400' }),
      makeVenueLesson(`GEK1902/${ZWSP}GES1001`, { startTime: '1200' }),
    ]);

    expect(aliases).toEqual({
      GEK1901: new Set(['GET1001']),
      GET1001: new Set(['GEK1901']),
      GES1001: new Set(['GEK1902']),
      GEK1902: new Set(['GES1001']),
    });
  });

  it('should not merge modules on different weeks', () => {
    const { lessons, aliases } = mergeDualCodedModules([
      makeVenueLesson('GEK1901', { weeks: ODD_WEEK }),
      makeVenueLesson('GET1001', { weeks: EVEN_WEEK }),
    ]);

    expect(lessons).toEqual([
      makeVenueLesson('GEK1901', { weeks: ODD_WEEK }),
      makeVenueLesson('GET1001', { weeks: EVEN_WEEK }),
    ]);

    expect(aliases).toEqual({});
  });
});
