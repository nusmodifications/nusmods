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

  const deserialize = (serializedConfig: string) =>
    deserializeTimetable(serializedConfig, mockGetModuleSemesterTimetable);

  describe('deserialized config should be identical to config that was serialized', () => {
    const serializeThenDeserialize = (config: SemTimetableConfig) =>
      deserialize(serializeTimetable(config)).semTimetableConfig;

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
        expect(serializeThenDeserialize(config)).toEqual(config);
      });
    });

    test('deserializing timetable with ta and hidden modules', () => {
      expect(deserialize('CS1010S=LEC:(0)&CS3216=LEC:(0)&ta=CS1010S&hidden=CS3216')).toEqual({
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
  });

  describe('deserializing v2 strings', () => {
    describe('typical strings', () => {
      test('with non-ta modules and ta modules', () => {
        expect(
          deserialize(
            'CS1010S=LEC:(0);REC:(3);TUT:(30)' + '&CS4243=LAB:(1);LEC:(5)' + '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: [0],
              Recitation: [3],
              Tutorial: [30],
            },
            CS4243: {
              Laboratory: [1],
              Lecture: [5],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('with non-ta modules and ta modules that are hidden', () => {
        expect(
          deserialize(
            'CS1010S=LEC:(0);REC:(3);TUT:(30)' +
              '&CS4243=LAB:(1);LEC:(5)' +
              '&hidden=CS1010S,CS4243' +
              '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: [0],
              Recitation: [3],
              Tutorial: [30],
            },
            CS4243: {
              Laboratory: [1],
              Lecture: [5],
            },
          },
          ta: ['CS4243'],
          hidden: ['CS1010S', 'CS4243'],
        });
      });
    });

    describe('deserializing edge cases', () => {
      test('duplicate module code', () => {
        expect(deserialize('CS1010S=LEC:(0)&CS1010S=REC:(1)')).toEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: [0],
              Recitation: [1],
            },
          },
          ta: [],
          hidden: [],
        });
      });

      test('no lessons', () => {
        expect(deserialize('CS2105&CS3217&CS1010S=LEC:(0)&ta=&hidden=')).toEqual({
          semTimetableConfig: {
            CS2105: {},
            CS3217: {},
            CS1010S: {
              Lecture: [0],
            },
          },
          ta: [],
          hidden: [],
        });
      });

      test('should ignore invalid lesson indices', () => {
        expect(deserialize('CS1010S=LEC:(20)')).toEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: [],
            },
          },
          ta: [],
          hidden: [],
        });
      });
    });
  });

  describe('deserializing v1 strings', () => {
    describe('typical strings', () => {
      test('with non-ta modules and ta modules', () => {
        expect(
          deserialize(
            'CS1010S=LEC:1,TUT:8&CS3216=LEC:1&ta=CS3216(LEC:1),CS1010S(LEC:1,TUT:2,TUT:3)&hidden=CS3216',
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
    });

    describe('deserializing edge cases', () => {
      test('should ignore invalid lesson type', () => {
        expect(deserialize('CS1010S=LEC:1&ta=CS1010S(TUT:2,INVALIDLESSONTYPE:1)')).toEqual({
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
        expect(deserialize('CS1010S=LEC:INVALIDCLASSNO')).toEqual({
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
        expect(deserialize('CS1010S=LEC:1&ta=CS3216(LEC:1)&ta=CS1010S(TUT:2)')).toEqual({
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
        expect(deserialize('CS1010S=LEC:1&ta=CS1010S(LEC:2)')).toEqual({
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
        expect(deserialize('CS1010S=LEC:1,TUT:3&ta=CS1010S()')).toEqual({
          semTimetableConfig: {
            CS1010S: {},
          },
          ta: ['CS1010S'],
          hidden: [],
        });
      });

      test('ignore modules without semester data', () => {
        expect(deserialize('CS1010S=LEC:1,REC:1,TUT:3&ta=CS3217(LEC:1)')).toEqual({
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
        expect(deserialize('CS1010S=LEC:1,REC:1,TUT:3&ta=INVALID),CS1010S(LEC:1)')).toEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: [0],
            },
          },
          ta: ['CS1010S'],
          hidden: [],
        });
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
