import { SemTimetableConfig } from 'types/timetables';
import { ModuleCode, Semester } from 'types/modules';

import { CS1010S, CS3216, CS4243 } from '__mocks__/modules';

import { deserializeTimetable, getImportedModuleCodes, serializeTimetable } from './shareLinks';
import { ModulesMap } from 'types/reducers';
import qs from 'query-string';

describe('timetable serialization/deserialization', () => {
  const modules = {
    CS1010S,
    CS3216,
    CS4243,
  } as ModulesMap;
  const semester: Semester = 1;

  const deserialize = (serializedConfig: string) =>
    deserializeTimetable(serializedConfig, modules, semester);

  describe('deserialized config should be identical to config that was serialized', () => {
    const serializeThenDeserialize = (config: {
      semTimetableConfig: SemTimetableConfig;
      hidden: ModuleCode[];
      ta: ModuleCode[];
    }) => deserialize(serializeTimetable(config));

    test('empty semTimetableConfig', () => {
      const config = {
        semTimetableConfig: {},
        hidden: [],
        ta: [],
      };

      expect(serializeThenDeserialize(config)).toStrictEqual(config);
    });
    test('config with hidden and ta modules', () => {
      const config = {
        semTimetableConfig: {
          CS1010S: {
            Lecture: ['1'],
            Recitation: ['2'],
            Tutorial: ['3'],
          },
          CS4243: {
            Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
            Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          },
        },
        hidden: [],
        ta: ['CS4243'],
      };

      expect(serializeThenDeserialize(config)).toStrictEqual(config);
    });
  });

  describe('deserializing v3 strings', () => {
    describe('typical strings', () => {
      test('with non-ta modules and ta modules', () => {
        expect(
          deserialize(
            'CS1010S=LEC:1,REC:2,TUT:3' +
              '&CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);LEC:(1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13)' +
              '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('with non-ta modules and ta modules that are hidden', () => {
        expect(
          deserialize(
            'CS1010S=LEC:1,REC:2,TUT:3' +
              '&CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);LEC:(1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13)' +
              '&hidden=CS1010S,CS4243' +
              '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: ['CS1010S', 'CS4243'],
        });
      });
    });
    describe('edge cases', () => {
      test('empty semTimetableConfig string should not error', () => {
        expect(deserialize('')).toStrictEqual({
          semTimetableConfig: {},
          ta: [],
          hidden: [],
        });
      });
      test('non-ta modules with serializedLessonDetails lessonId are converted to classNo', () => {
        expect(
          deserialize(
            'CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);LEC:(1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13)',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS4243: {
              Laboratory: ['2'],
              Lecture: ['1'],
            },
          },
          ta: [],
          hidden: [],
        });
      });
      test('ta modules with classNo lessonId are converted to serializedLessonDetails', () => {
        expect(deserialize('CS4243=LAB:2,LEC:1&ta=CS4243')).toStrictEqual({
          semTimetableConfig: {
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('multiple non-ta and ta modules configs are combined', () => {
        expect(
          deserialize(
            'CS1010S=LEC:1,REC:2' +
              '&CS1010S=TUT:3' +
              '&CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13)' +
              '&CS4243=LEC:(1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13)' +
              '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('if user manually enters multiple hidden and ta query keys, use latest one', () => {
        expect(
          deserialize(
            'CS1010S=LEC:1,REC:2,TUT:3' +
              '&CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);LEC:(1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13)' +
              '&CS3216=LEC:(1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13)' +
              '&hidden=CS1010S,CS3216' +
              '&hidden=CS4243' +
              '&ta=CS1010S' +
              '&ta=CS4243,CS3216',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
            CS3216: {
              Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          hidden: ['CS4243'],
          ta: ['CS4243', 'CS3216'],
        });
      });
      test('invalid module codes are excluded, other modules should be deserialized correctly', () => {
        expect(
          deserialize(
            'CS1010S=LEC:1,REC:2,TUT:3' +
              '&INVALIDMODULECODE=LEC:1' +
              '&CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);LEC:(1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13)' +
              '&ANOTHERINVALIDMODULECODE=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);LEC:(1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13)' +
              '&ta=CS4243,ANOTHERINVALIDMODULECODE',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('empty module config should not error', () => {
        expect(deserialize('CS1010S=' + '&CS4243=' + '&ta=CS4243')).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {},
            CS4243: {},
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('invalid lesson types are excluded, other lesson types should be deserialized correctly', () => {
        expect(
          deserialize(
            'CS1010S=ABC:1,SEC:1,REC:2,TUT:3' +
              '&CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);ABC:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);SEC:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13)' +
              '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('lesson type with no lessonId should not error', () => {
        expect(
          deserialize(
            'CS1010S=LEC:,REC:2,TUT:3' +
              '&CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);LEC:()' +
              '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: [],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: [],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('invalid lessonId are excluded, other lessons should be deserialized correctly', () => {
        expect(
          deserialize(
            'CS1010S=LEC:2,REC:2,TUT:3' +
              '&CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13);LEC:(2|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13)' +
              '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: [],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: [],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
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
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
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
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: ['CS1010S', 'CS4243'],
        });
      });
    });
    describe('deserializing edge cases', () => {
      test('multiple non-ta and ta modules configs are combined', () => {
        expect(
          deserialize(
            'CS1010S=LEC:(0);REC:(3)' +
              '&CS1010S=TUT:(30)' +
              '&CS4243=LAB:(1)' +
              '&CS4243=LEC:(5)' +
              '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('if user manually enters multiple hidden and ta query keys, use latest one', () => {
        expect(
          deserialize(
            'CS1010S=LEC:(0);REC:(3);TUT:(30)' +
              '&CS4243=LAB:(1);LEC:(5)' +
              '&CS3216=LEC:(0)' +
              '&hidden=CS1010S,CS3216' +
              '&hidden=CS4243' +
              '&ta=CS1010S' +
              '&ta=CS4243,CS3216',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
            CS3216: {
              Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          hidden: ['CS4243'],
          ta: ['CS4243', 'CS3216'],
        });
      });
      test('invalid module codes are excluded, other modules should be deserialized correctly', () => {
        expect(
          deserialize(
            'CS1010S=LEC:(0);REC:(3);TUT:(30)' +
              '&CS4243=LAB:(1);LEC:(5)' +
              '&INVALIDMODULECODE=LEC:(1)' +
              '&ANOTHERINVALIDMODULECODE=TUT:(1)' +
              '&ta=CS4243,ANOTHERINVALIDMODULECODE',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('empty module config should not error', () => {
        expect(deserialize('CS1010S=' + '&CS4243=' + '&ta=CS4243')).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {},
            CS4243: {},
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('invalid lesson types are excluded, other lesson types should be deserialized correctly', () => {
        expect(
          deserialize(
            'CS1010S=ABC:(0);SEC:(0);REC:(3);TUT:(30)' +
              '&CS4243=ABC:(0);SEC:(0);LAB:(1)' +
              '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('lesson type with no lessonId should not error', () => {
        expect(
          deserialize('CS1010S=LEC:();REC:(3);TUT:(30)' + '&CS4243=LAB:(1);LEC:()' + '&ta=CS4243'),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: [],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: [],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('ignore invalid lessonIndex, other lessons should be deserialized correctly', () => {
        expect(
          deserialize(
            'CS1010S=LEC:(1);REC:(3);TUT:(30)' + '&CS4243=LAB:(1);LEC:(6)' + '&ta=CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: [],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: [],
            },
          },
          ta: ['CS4243'],
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
            'CS1010S=LEC:1,REC:2,TUT:3' + '&CS4243=LAB:2,LEC:1' + '&ta=CS4243(LAB:2,LEC:1)',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('with non-ta modules and ta modules that are hidden', () => {
        expect(
          deserialize(
            'CS1010S=LEC:1,REC:2,TUT:3' +
              '&CS4243=LAB:2,LEC:1' +
              '&ta=CS4243(LAB:2,LEC:1)' +
              '&hidden=CS1010S,CS4243',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: ['CS1010S', 'CS4243'],
        });
      });
    });
    describe('deserializing edge cases', () => {
      test('if user manually enters multiple hidden and ta query keys, use latest one', () => {
        expect(
          deserialize(
            'CS1010S=LEC:1,REC:2' +
              '&CS1010S=TUT:3' +
              '&CS4243=LAB:2,LEC:1' +
              '&CS3216=LEC:1' +
              '&hidden=CS1010S,CS3216' +
              '&hidden=CS4243' +
              '&ta=CS1010S(LEC:1,REC:2,TUT:3)' +
              '&ta=CS4243(LAB:2,LEC:1),CS3216(LEC:1)',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: ['1|MON|1830|2030|LT15|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
            CS3216: {
              Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          hidden: ['CS4243'],
          ta: ['CS4243', 'CS3216'],
        });
      });
      test('invalid TA module code', () => {
        expect(
          deserialize(
            'CS1010S=LEC:1,REC:2,TUT:3' +
              '&CS4243=LAB:2,LEC:1' +
              '&INVALIDMODULECODE=LEC:1' +
              '&ANOTHERINVALIDMODULECODE=LEC:1' +
              '&ta=CS4243(LAB:2),ANOTHERINVALIDMODULECODE(LEC:1)',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('empty TA lesson config', () => {
        expect(
          deserialize('CS1010S=LEC:1,REC:2,TUT:3' + '&CS4243=LAB:2,LEC:1' + '&ta=CS4243()'),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: ['1'],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {},
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('invalid lesson types are excluded, other lesson types should be deserialized correctly', () => {
        expect(
          deserialize(
            'CS1010S=ABC:1,SEC:1,REC:2,TUT:3' +
              '&CS4243=LAB:2,LEC:1' +
              '&ta=CS4243(ABC:1,SEC:1,LAB:2)',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
      test('invalid classNo in TA lesson config', () => {
        expect(
          deserialize(
            'CS1010S=LEC:2,REC:2,TUT:3' + '&CS4243=LAB:2,LEC:1' + '&ta=CS4243(LAB:2,LEC:2)',
          ),
        ).toStrictEqual({
          semTimetableConfig: {
            CS1010S: {
              Lecture: [],
              Recitation: ['2'],
              Tutorial: ['3'],
            },
            CS4243: {
              Laboratory: ['2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13'],
              Lecture: [],
            },
          },
          ta: ['CS4243'],
          hidden: [],
        });
      });
    });
  });
});

describe('getting TA module codes of imported timetable', () => {
  test('getting TA module codes of v1 serialization string', () => {
    const searchString =
      '?CS1010S=LEC1:1,REC:2,TUT:3\
      &CS4243=LAB:2,LEC:1\
      &ta=CS4243(LAB:2)';
    expect(getImportedModuleCodes(qs.parse(searchString))).toStrictEqual(['CS1010S', 'CS4243']);
  });

  test('only count modules from last TA params of v1 serialization string', () => {
    const searchString =
      '?CS1010S=LEC1:1,REC:2,TUT:3\
      &CS4243=LAB:2,LEC:1\
      &ta=CS3216(LEC1:1),CS4243(LAB:2)\
      &ta=CS4243(LAB:2)';
    expect(getImportedModuleCodes(qs.parse(searchString))).toStrictEqual(['CS1010S', 'CS4243']);
  });

  test('getting TA module codes of v2 serialization string', () => {
    const searchString =
      '?CS1010S=LEC1:(0);REC:(3);TUT:(30)\
      &CS4243=LAB:(2)\
      &ta=CS4243';
    expect(getImportedModuleCodes(qs.parse(searchString))).toStrictEqual(['CS1010S', 'CS4243']);
  });

  test('getting TA module codes of v3 serialization string', () => {
    const searchString =
      '?CS1010S=LEC1:1,REC:2,TUT:3\
      &CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13)\
      &ta=CS4243';
    expect(getImportedModuleCodes(qs.parse(searchString))).toStrictEqual(['CS1010S', 'CS4243']);
  });

  test('only count modules from last TA params of v2/v3 serialization string', () => {
    const searchString =
      '?CS1010S=LEC1:1,REC:2,TUT:3\
      &CS4243=LAB:(2|TUE|1600|1800|AS6-0421|3_4_5_6_7_8_9_10_11_12_13)\
      &ta=CS3216,CS4243\
      &ta=CS4243';
    expect(getImportedModuleCodes(qs.parse(searchString))).toStrictEqual(['CS1010S', 'CS4243']);
  });
});
