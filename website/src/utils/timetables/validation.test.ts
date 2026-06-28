import { ModuleLessonConfig } from 'types/timetables';
import { Semester } from 'types/modules';

import { CS1010S, CS4243 } from '__mocks__/modules';
import moduleCodeMapJSON from '__mocks__/module-code-map.json';

import { validateModuleLessons, validateTimetableModules } from './validation';

// TODO: Fix this later
const moduleCodeMap = moduleCodeMapJSON as any;

describe(validateTimetableModules, () => {
  test('should leave valid modules untouched', () => {
    expect(validateTimetableModules({}, moduleCodeMap)).toEqual([{}, []]);
    expect(
      validateTimetableModules(
        {
          CS1010S: {},
          CS2100: {},
        },
        moduleCodeMap,
      ),
    ).toEqual([{ CS1010S: {}, CS2100: {} }, []]);
  });

  test('should remove invalid modules', () => {
    expect(
      validateTimetableModules(
        {
          DEADBEEF: {},
          CS2100: {},
        },
        moduleCodeMap,
      ),
    ).toEqual([{ CS2100: {} }, ['DEADBEEF']]);
  });
});

// - either normal non-TA or TA module
//   - remove lesson group if there are lessons of other lesson types
// - if module is a normal non TA module:
//   - remove lesson group if any lesson is missing
//   - remove lesson group if there are extra lessons
//
describe(validateModuleLessons, () => {
  const semester: Semester = 1;

  describe('validate non ta module lessons', () => {
    const lessons: ModuleLessonConfig = {
      Lecture: ['1'],
      Recitation: ['2'],
      Tutorial: ['3'],
    };

    test('should leave valid lessons untouched', () => {
      expect(validateModuleLessons(semester, lessons, CS1010S, false)).toStrictEqual({
        validatedLessonConfig: lessons,
        valid: true,
      });
    });

    test('should convert serializedLessonDetails lessonId to classNo lessonId', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Recitation: ['2|THU|1300|1400|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          },
          CS1010S,
          false,
        ),
      ).toStrictEqual({
        validatedLessonConfig: lessons,
        valid: false,
      });
    });

    test('should recover configs with invalid classNo', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Lecture: ['2'],
          },
          CS1010S,
          false,
        ),
      ).toStrictEqual({
        validatedLessonConfig: lessons,
        valid: false,
      });
    });

    test('should remove lesson types which do not exist in module', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Laboratory: ['1'], // CS1010S has no lab
          },
          CS1010S,
          false,
        ),
      ).toStrictEqual({ validatedLessonConfig: lessons, valid: false });
    });

    test('should add lessons for when they are missing', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            Tutorial: ['3'],
          },
          CS1010S,
          false,
        ),
      ).toStrictEqual({
        validatedLessonConfig: {
          Lecture: ['1'],
          Recitation: ['1'],
          Tutorial: ['3'],
        },
        valid: false,
      });
    });
  });

  describe('validate ta module lessons', () => {
    const lessons: ModuleLessonConfig = {
      Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
      Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
    };

    test('should leave valid config untouched', () => {
      expect(validateModuleLessons(semester, lessons, CS4243, true)).toStrictEqual({
        validatedLessonConfig: lessons,
        valid: true,
      });
    });

    test('should convert classNo lessonId to serializedLessonDetails', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Laboratory: ['2'],
          },
          CS4243,
          true,
        ),
      ).toStrictEqual({
        validatedLessonConfig: lessons,
        valid: false,
      });
    });

    test('should remove lesson types which do not exist in module', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Recitation: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          },
          CS4243,
          true,
        ),
      ).toStrictEqual({
        validatedLessonConfig: lessons,
        valid: false,
      });
    });

    test('should replace lessons that have invalid class no', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Lecture: ['1|THU|1200|1300|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'], // lesson is not a lecture
          },
          CS4243,
          true,
        ),
      ).toStrictEqual({
        validatedLessonConfig: lessons,
        valid: false,
      });
    });

    test('should attempt to recover if config has no lessons', () => {
      expect(validateModuleLessons(semester, {}, CS4243, true)).toStrictEqual({
        validatedLessonConfig: {
          Laboratory: ['1|TUE|1400|1600|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
          Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        },
        valid: false,
      });
    });
  });
});
