import { get } from 'lodash-es';
import { SemTimetableConfig } from 'types/timetables';
import { ModuleCode, RawLessonWithIndex } from 'types/modules';

import { getModuleTimetable } from 'utils/modules';

import { CS1010S, CS3216, CS4243, GER1000 } from '__mocks__/modules';

import { deserializeTimetable, parseTaModuleCodes, serializeTimetable } from './shareLinks';

describe('timetable serialization/deserialization', () => {
  const mockSemesterTimetable: { [moduleCode: ModuleCode]: readonly RawLessonWithIndex[] } = {
    CS1010S: getModuleTimetable(CS1010S, 1),
    CS3216: getModuleTimetable(CS3216, 1),
    GER1000: getModuleTimetable(GER1000, 1),
    CS4243: getModuleTimetable(CS4243, 1),
  };
  const mockGetModuleSemesterTimetable = (moduleCode: ModuleCode): readonly RawLessonWithIndex[] =>
    get(mockSemesterTimetable, moduleCode);

  test('timetable serialization/deserialization', () => {
    const configs: SemTimetableConfig[] = [
      {},
      { CS1010S: {} },
      {
        GER1000: { Tutorial: [13] },
      },
      {
        CS4243: { Laboratory: [2], Lecture: [5] },
        GER1000: { Tutorial: [13] },
      },
    ];

    configs.forEach((config) => {
      expect(
        deserializeTimetable(serializeTimetable(config), mockGetModuleSemesterTimetable)
          .semTimetableConfig,
      ).toEqual(config);
    });
  });

  test('deserializing timetable with ta and hidden modules', () => {
    expect(
      deserializeTimetable(
        'CS1010S=LEC:(0)&CS3216=LEC:(0)&ta=CS1010S&hidden=CS3216',
        mockGetModuleSemesterTimetable,
      ),
    ).toEqual({
      semTimetableConfig: {
        CS1010S: {
          Lecture: [0],
        },
        CS3216: {
          Lecture: [0],
        },
      },
      ta: ['CS1010S'],
      hidden: ['CS3216'],
    });
  });

  describe('deserializing edge cases', () => {
    test('duplicate module code', () => {
      expect(
        deserializeTimetable('CS1010S=LEC:(0)&CS1010S=REC:(1)', mockGetModuleSemesterTimetable)
          .semTimetableConfig,
      ).toEqual({
        CS1010S: {
          Lecture: [0],
          Recitation: [1],
        },
      });
    });

    test('no lessons', () => {
      expect(
        deserializeTimetable(
          'CS2105&CS3217&CS1010S=LEC:(0)&ta=&hidden=',
          mockGetModuleSemesterTimetable,
        ).semTimetableConfig,
      ).toEqual({
        CS2105: {},
        CS3217: {},
        CS1010S: {
          Lecture: [0],
        },
      });
    });

    test('should ignore invalid lesson indices', () => {
      expect(
        deserializeTimetable('CS1010S=LEC:(20)', mockGetModuleSemesterTimetable).semTimetableConfig,
      ).toEqual({
        CS1010S: {
          Lecture: [],
        },
      });
    });
  });

  test('should return empty array if v2 serialized', () => {
    expect(parseTaModuleCodes('(CS1010S,CS3216)')).toEqual([]);
  });

  describe('deserialize v1 config', () => {
    test('deserialize v1', () => {
      expect(
        deserializeTimetable(
          'CS1010S=LEC:1,TUT:8&CS3216=LEC:1&ta=CS3216(LEC:1),CS1010S(LEC:1,TUT:2,TUT:3)&hidden=CS3216',
          mockGetModuleSemesterTimetable,
        ),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Lecture: [0],
            Tutorial: [21, 30],
          },
          CS3216: {
            Lecture: [0],
          },
        },
        ta: ['CS3216', 'CS1010S'],
        hidden: ['CS3216'],
      });
    });

    test('should ignore invalid lesson type', () => {
      expect(
        deserializeTimetable(
          'CS1010S=LEC:1&ta=CS1010S(TUT:2,INVALIDLESSONTYPE:1)',
          mockGetModuleSemesterTimetable,
        ),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Tutorial: [21],
          },
        },
        ta: ['CS1010S'],
        hidden: [],
      });
    });

    test('should ignore invalid classNo', () => {
      expect(
        deserializeTimetable('CS1010S=LEC:INVALIDCLASSNO', mockGetModuleSemesterTimetable),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Lecture: [],
          },
        },
        ta: [],
        hidden: [],
      });
    });

    test('use only last ta param', () => {
      expect(
        deserializeTimetable(
          'CS1010S=LEC:1&ta=CS3216(LEC:1)&ta=CS1010S(TUT:2)',
          mockGetModuleSemesterTimetable,
        ),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Tutorial: [21],
          },
        },
        ta: ['CS1010S'],
        hidden: [],
      });
    });

    test('should ignore invalid ta lessons', () => {
      expect(
        deserializeTimetable('CS1010S=LEC:1&ta=CS1010S(LEC:2)', mockGetModuleSemesterTimetable),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Lecture: [],
          },
        },
        ta: ['CS1010S'],
        hidden: [],
      });
    });

    test('ta module config without lessons', () => {
      expect(
        deserializeTimetable('CS1010S=LEC:1,TUT:3&ta=CS1010S()', mockGetModuleSemesterTimetable),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {},
        },
        ta: ['CS1010S'],
        hidden: [],
      });
    });

    test('ignore modules without semester data', () => {
      expect(
        deserializeTimetable(
          'CS1010S=LEC:1,REC:1,TUT:3&ta=CS3217(LEC:1)',
          mockGetModuleSemesterTimetable,
        ),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Lecture: [0],
            Recitation: [1],
            Tutorial: [30],
          },
        },
        ta: [],
        hidden: [],
      });
    });

    test('should ignore invalid ta module config', () => {
      expect(
        deserializeTimetable(
          'CS1010S=LEC:1,REC:1,TUT:3&ta=INVALID),CS1010S(LEC:1)',
          mockGetModuleSemesterTimetable,
        ),
      ).toEqual({
        semTimetableConfig: {
          CS1010S: {
            Lecture: [0],
          },
        },
        ta: ['CS1010S'],
        hidden: [],
      });
    });

    test('should return array of module codes', () => {
      expect(parseTaModuleCodes('CS1010S(LEC:1,TUT:1),CS3216(LEC:1)')).toEqual([
        'CS1010S',
        'CS3216',
      ]);
    });
  });
});
