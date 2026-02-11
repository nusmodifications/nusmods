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
  normalizeForComparison,
  findEquivalentModules,
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

describe(normalizeForComparison, () => {
  it('should lowercase strings', () => {
    expect(normalizeForComparison('Hello World')).toEqual('hello world');
    expect(normalizeForComparison('HELLO WORLD')).toEqual('hello world');
  });

  it('should collapse multiple whitespace characters', () => {
    expect(normalizeForComparison('hello   world')).toEqual('hello world');
    expect(normalizeForComparison('hello\t\nworld')).toEqual('hello world');
    expect(normalizeForComparison('hello \n\t  world')).toEqual('hello world');
  });

  it('should trim leading and trailing whitespace', () => {
    expect(normalizeForComparison('  hello world  ')).toEqual('hello world');
    expect(normalizeForComparison('\nhello world\t')).toEqual('hello world');
  });

  it('should handle null and undefined', () => {
    expect(normalizeForComparison(null)).toEqual('');
    expect(normalizeForComparison(undefined)).toEqual('');
  });

  it('should handle empty strings', () => {
    expect(normalizeForComparison('')).toEqual('');
    expect(normalizeForComparison('   ')).toEqual('');
  });

  it('should combine all transformations', () => {
    expect(normalizeForComparison('  HELLO   WORLD\t\n')).toEqual('hello world');
  });
});

describe(findEquivalentModules, () => {
  const makeModuleInfo = (
    code: string,
    title: string,
    credits: number | null,
    description: string,
  ) => ({
    Code: code,
    Title: title,
    UnitsMin: credits,
    CourseDesc: description,
  });

  it('should find modules with matching title, credits, and description', () => {
    const withoutTimetable = [
      makeModuleInfo('GEH1007', 'Quantitative Reasoning', 4, 'This module teaches quantitative reasoning.'),
    ];
    const withTimetable = [
      makeModuleInfo('GEC1038', 'Quantitative Reasoning', 4, 'This module teaches quantitative reasoning.'),
    ];

    const result = findEquivalentModules(withoutTimetable, withTimetable);

    expect(result.size).toBe(1);
    expect(result.get('GEH1007')).toBe('GEC1038');
  });

  it('should not match modules with different titles', () => {
    const withoutTimetable = [
      makeModuleInfo('GEH1007', 'Quantitative Reasoning', 4, 'This module teaches quantitative reasoning.'),
    ];
    const withTimetable = [
      makeModuleInfo('GEC1038', 'Different Title', 4, 'This module teaches quantitative reasoning.'),
    ];

    const result = findEquivalentModules(withoutTimetable, withTimetable);

    expect(result.size).toBe(0);
  });

  it('should not match modules with different credits', () => {
    const withoutTimetable = [
      makeModuleInfo('GEH1007', 'Quantitative Reasoning', 4, 'This module teaches quantitative reasoning.'),
    ];
    const withTimetable = [
      makeModuleInfo('GEC1038', 'Quantitative Reasoning', 2, 'This module teaches quantitative reasoning.'),
    ];

    const result = findEquivalentModules(withoutTimetable, withTimetable);

    expect(result.size).toBe(0);
  });

  it('should not match modules with different descriptions', () => {
    const withoutTimetable = [
      makeModuleInfo('GEH1007', 'Quantitative Reasoning', 4, 'This module teaches quantitative reasoning.'),
    ];
    const withTimetable = [
      makeModuleInfo('GEC1038', 'Quantitative Reasoning', 4, 'This is a different description.'),
    ];

    const result = findEquivalentModules(withoutTimetable, withTimetable);

    expect(result.size).toBe(0);
  });

  it('should handle null credits', () => {
    const withoutTimetable = [
      makeModuleInfo('MOD001', 'Test Module', null, 'Test description'),
    ];
    const withTimetable = [
      makeModuleInfo('MOD002', 'Test Module', null, 'Test description'),
    ];

    const result = findEquivalentModules(withoutTimetable, withTimetable);

    expect(result.size).toBe(1);
    expect(result.get('MOD001')).toBe('MOD002');
  });

  it('should normalize title comparison', () => {
    const withoutTimetable = [
      makeModuleInfo('GEH1007', 'QUANTITATIVE   REASONING', 4, 'This module teaches quantitative reasoning.'),
    ];
    const withTimetable = [
      makeModuleInfo('GEC1038', 'quantitative reasoning', 4, 'This module teaches quantitative reasoning.'),
    ];

    const result = findEquivalentModules(withoutTimetable, withTimetable);

    expect(result.size).toBe(1);
    expect(result.get('GEH1007')).toBe('GEC1038');
  });

  it('should normalize description comparison', () => {
    const withoutTimetable = [
      makeModuleInfo('GEH1007', 'Quantitative Reasoning', 4, 'This   module\nteaches  quantitative reasoning.'),
    ];
    const withTimetable = [
      makeModuleInfo('GEC1038', 'Quantitative Reasoning', 4, 'This module teaches quantitative reasoning.'),
    ];

    const result = findEquivalentModules(withoutTimetable, withTimetable);

    expect(result.size).toBe(1);
    expect(result.get('GEH1007')).toBe('GEC1038');
  });

  it('should handle multiple module matches (many-to-one)', () => {
    const withoutTimetable = [
      makeModuleInfo('GEH1007', 'Quantitative Reasoning', 4, 'Test description'),
      makeModuleInfo('GEK1001', 'Quantitative Reasoning', 4, 'Test description'),
    ];
    const withTimetable = [
      makeModuleInfo('GEC1038', 'Quantitative Reasoning', 4, 'Test description'),
    ];

    const result = findEquivalentModules(withoutTimetable, withTimetable);

    expect(result.size).toBe(2);
    expect(result.get('GEH1007')).toBe('GEC1038');
    expect(result.get('GEK1001')).toBe('GEC1038');
  });

  it('should handle modules with same title but different descriptions (no false positives)', () => {
    const withoutTimetable = [
      makeModuleInfo('IS1001', 'Independent Study Module', 4, 'Study computer science topics.'),
    ];
    const withTimetable = [
      makeModuleInfo('IS2001', 'Independent Study Module', 4, 'Study mathematics topics.'),
    ];

    const result = findEquivalentModules(withoutTimetable, withTimetable);

    expect(result.size).toBe(0);
  });

  it('should return empty map when no candidates match', () => {
    const withoutTimetable = [
      makeModuleInfo('MOD001', 'Module One', 4, 'Description one'),
    ];
    const withTimetable = [
      makeModuleInfo('MOD002', 'Module Two', 4, 'Description two'),
    ];

    const result = findEquivalentModules(withoutTimetable, withTimetable);

    expect(result.size).toBe(0);
  });

  it('should return empty map when inputs are empty', () => {
    expect(findEquivalentModules([], []).size).toBe(0);
  });
});
