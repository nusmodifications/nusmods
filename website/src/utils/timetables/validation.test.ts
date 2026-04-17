import { ModuleLessonConfig } from 'types/timetables';
import { Semester } from 'types/modules';

import { CS1010S } from '__mocks__/modules';
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

// TODO: validate module lessons
// - either normal non-TA or TA module
//   - remove lesson group if there are lessons of other lesson types
// - if module is a normal non TA module:
//   - remove lesson group if any lesson is missing
//   - remove lesson group if there are extra lessons
//
describe(validateModuleLessons, () => {
  const semester: Semester = 1;
  const lessons: ModuleLessonConfig = {
    Lecture: [0],
    Recitation: [2],
    Tutorial: [13],
  };

  describe('validate non ta module lessons', () => {
    test('should leave valid lessons untouched', () => {
      expect(validateModuleLessons(semester, lessons, CS1010S, false)).toEqual({
        validatedLessonConfig: lessons,
        valid: true,
      });
    });

    test('should remove lesson types which do not exist in module', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Laboratory: [0], // CS1010S has no lab
          },
          CS1010S,
          false,
        ),
      ).toEqual({ validatedLessonConfig: lessons, valid: false });
    });

    test('should replace lessons that have invalid class no', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Lecture: [2], // CS1010S lesson index 2 is not a lecture
          },
          CS1010S,
          false,
        ),
      ).toEqual({ validatedLessonConfig: lessons, valid: false });
    });

    test('should add lessons for when they are missing', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            Tutorial: [13],
          },
          CS1010S,
          false,
        ),
      ).toEqual({
        validatedLessonConfig: {
          Lecture: [0],
          Recitation: [1],
          Tutorial: [13],
        },
        valid: false,
      });
    });
  });

  describe('validate ta module lessons', () => {
    test('should leave valid config untouched', () => {
      expect(validateModuleLessons(semester, lessons, CS1010S, true)).toEqual({
        validatedLessonConfig: lessons,
        valid: true,
      });
    });

    test('should remove lesson types which do not exist in module', () => {
      expect(
        validateModuleLessons(
          semester,
          {
            ...lessons,
            Laboratory: [0],
          },
          CS1010S,
          true,
        ),
      ).toEqual({
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
            Lecture: [1],
          },
          CS1010S,
          true,
        ),
      ).toEqual({
        validatedLessonConfig: lessons,
        valid: false,
      });
    });
  });
});
