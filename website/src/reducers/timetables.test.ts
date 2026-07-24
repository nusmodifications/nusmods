import reducer, { defaultTimetableState, stateReconciler } from 'reducers/timetables';
import {
  ADD_MODULE,
  hideLessonInTimetable,
  removeModule,
  SET_TIMETABLE,
  setLessonConfig,
  showLessonInTimetable,
  setHiddenImported,
  Internal,
  addTaModule,
  addLesson,
  removeLesson,
  changeLesson,
} from 'actions/timetables';
import { TimetablesState } from 'types/reducers';
import config from 'config';
import { ModuleLessonConfig, TimetableConfig } from 'types/timetables';
import { LessonId } from 'types/modules';

const initialState = defaultTimetableState;

vi.mock('config');

/* eslint-disable no-useless-computed-key */
describe('color reducers', () => {
  test('should add colors when modules are added', () => {
    expect(
      reducer(initialState, {
        type: ADD_MODULE,
        payload: {
          semester: 1,
          moduleCode: 'CS1010S',
          moduleLessonConfig: {},
        },
      }).colors,
    ).toHaveProperty('1.CS1010S');

    expect(
      reducer(initialState, {
        type: ADD_MODULE,
        payload: {
          semester: 2,
          moduleCode: 'CS3216',
          moduleLessonConfig: {},
        },
      }).colors,
    ).toHaveProperty('2.CS3216');
  });

  test('should remove colors when modules are removed', () => {
    const state = {
      ...initialState,
      colors: {
        [1]: { CS1010S: 1, CS3216: 0 },
        [2]: { CS1010S: 2, CS3217: 2 },
      },
    };

    expect(reducer(state, removeModule(1, 'CS1010S')).colors).toEqual({
      [1]: { CS3216: 0 },
      [2]: { CS1010S: 2, CS3217: 2 },
    });

    expect(reducer(state, removeModule(2, 'CS3217')).colors).toEqual({
      [1]: { CS1010S: 1, CS3216: 0 },
      [2]: { CS1010S: 2 },
    });
  });

  test('should set colors when timetable is set', () => {
    expect(
      reducer(initialState, {
        type: SET_TIMETABLE,
        payload: {
          semester: 1,
          timetable: { CS1010S: {} },
          colors: { CS1010S: 0 },
          hiddenModules: [],
          taModules: [],
        },
      }).colors[1],
    ).toEqual({
      CS1010S: 0,
    });
  });
});

describe('hidden module reducer', () => {
  const withHiddenModules: TimetablesState = {
    ...initialState,
    hidden: { [1]: ['CS1010S'], [2]: ['CS1010S'] },
  };

  test('should update hidden modules', () => {
    expect(reducer(initialState, hideLessonInTimetable(1, 'CS3216'))).toHaveProperty('hidden.1', [
      'CS3216',
    ]);

    expect(reducer(initialState, showLessonInTimetable(1, 'CS1010S'))).toMatchObject({
      hidden: {
        [1]: [],
      },
    });

    expect(reducer(withHiddenModules, showLessonInTimetable(1, 'CS1010S'))).toMatchObject({
      hidden: {
        [1]: [],
        [2]: ['CS1010S'],
      },
    });
  });

  test('should remove modules from list when modules are removed', () => {
    expect(
      reducer(
        {
          ...initialState,
          hidden: { [1]: ['CS1010S'], [2]: ['CS1010S'] },
        },
        removeModule(1, 'CS1010S'),
      ),
    ).toMatchObject({
      hidden: {
        [1]: [],
        [2]: ['CS1010S'],
      },
    });
  });
});

describe('TA module reducer', () => {
  test('should update TA modules', () => {
    expect(
      reducer(
        initialState,
        addTaModule(1, 'CS3216', {
          Lecture: ['1'],
        } satisfies ModuleLessonConfig),
      ),
    ).toHaveProperty('ta.1', ['CS3216'] satisfies LessonId[]);
  });

  test('should remove modules from list when modules are removed', () => {
    expect(
      reducer(
        {
          ...initialState,
          ta: { [1]: ['CS1010S'], [2]: ['CS1010S'] },
        },
        removeModule(1, 'CS1010S'),
      ),
    ).toMatchObject({
      ta: { [1]: [], [2]: ['CS1010S'] },
    });
  });
});

describe('lesson reducer', () => {
  test('should allow lesson config to be set', () => {
    expect(
      reducer(
        {
          ...initialState,
          lessons: {
            [1]: {
              CS1010S: {
                Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
                Recitation: ['2|THU|1300|1400|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'],
              },
              CS3216: {
                Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
              },
            },
            [2]: {
              CS3217: {
                Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
              },
            },
          } satisfies TimetableConfig,
        },
        setLessonConfig(1, 'CS1010S', {
          Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          Recitation: ['3|THU|1600|1700|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          Tutorial: ['1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13'],
        } satisfies ModuleLessonConfig),
      ),
    ).toMatchObject({
      lessons: {
        [1]: {
          CS1010S: {
            Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            Recitation: ['3|THU|1600|1700|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'],
            Tutorial: ['1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13'],
          },
          CS3216: {
            Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          },
        },
        [2]: {
          CS3217: {
            Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
          },
        },
      } satisfies TimetableConfig,
    });
  });

  test('should remove lessons in payload', () => {
    const timetableState: TimetablesState = {
      ...initialState,
      lessons: {
        1: {
          CS1010S: {
            Tutorial: [
              '1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13',
              '10|TUE|0900|1000|COM1-0209|3_4_5_6_7_8_9_10_11_12_13',
              '11|TUE|1000|1100|COM1-0208|3_4_5_6_7_8_9_10_11_12_13',
            ],
          },
        },
      },
    };

    expect(
      reducer(
        timetableState,
        removeLesson(1, 'CS1010S', 'Tutorial', [
          '10|TUE|0900|1000|COM1-0209|3_4_5_6_7_8_9_10_11_12_13',
          '11|TUE|1000|1100|COM1-0208|3_4_5_6_7_8_9_10_11_12_13',
        ]),
      ),
    ).toHaveProperty('lessons.1.CS1010S.Tutorial', [
      '1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13',
    ] satisfies LessonId[]);
  });

  test('should replace lessons with those in payload', () => {
    const timetableState: TimetablesState = {
      ...initialState,
      lessons: {
        1: {
          CS1010S: {
            Tutorial: [
              '1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13',
              '10|TUE|0900|1000|COM1-0209|3_4_5_6_7_8_9_10_11_12_13',
              '11|TUE|1000|1100|COM1-0208|3_4_5_6_7_8_9_10_11_12_13',
            ],
          },
        },
      },
    };

    expect(
      reducer(
        timetableState,
        changeLesson(1, 'CS1010S', 'Tutorial', [
          '12|TUE|1100|1200|COM1-0207|3_4_5_6_7_8_9_10_11_12_13',
          '13|TUE|1200|1300|COM1-0114|3_4_5_6_7_8_9_10_11_12_13',
        ]),
      ),
    ).toHaveProperty('lessons.1.CS1010S.Tutorial', [
      '12|TUE|1100|1200|COM1-0207|3_4_5_6_7_8_9_10_11_12_13',
      '13|TUE|1200|1300|COM1-0114|3_4_5_6_7_8_9_10_11_12_13',
    ] satisfies LessonId[]);
  });

  test('should not add duplicate TA lessons', () => {
    const withTaModules: TimetablesState = {
      ...initialState,
      lessons: {
        1: {
          CS1010S: {
            Tutorial: ['1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13'],
          },
        },
      },
      ta: {
        [1]: ['CS1010S'],
      },
    };

    expect(
      reducer(
        withTaModules,
        addLesson(1, 'CS1010S', 'Tutorial', [
          '1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13',
        ]),
      ),
    ).toMatchObject(withTaModules);
  });
});

describe(stateReconciler, () => {
  const oldArchive = {
    '2015/2016': {
      [1]: {
        GET1006: {
          Lecture: ['1'],
        },
      },
    },
  };

  const oldLessons: TimetableConfig = {
    [1]: {
      CS1010S: {
        Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        Recitation: ['2|THU|1300|1400|S14-0619|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      },
    },
    [2]: {
      CS3217: {
        Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
      },
    },
  };

  const inbound: TimetablesState = {
    lessons: oldLessons,
    colors: {
      [1]: {
        CS1010S: 1,
      },
      [2]: {
        CS3217: 2,
      },
    },
    hidden: {
      [1]: ['CS1010S'],
    },
    ta: {},
    academicYear: config.academicYear,
    archive: oldArchive,
  };

  const debug = false;

  test('should return inbound state when academic year is the same', () => {
    expect(stateReconciler(inbound, initialState, debug)).toEqual(inbound);
  });

  test('should archive old timetables and clear state when academic year is different', () => {
    const oldInbound = {
      ...inbound,
      academicYear: '2016/2017',
    };

    expect(stateReconciler(oldInbound, initialState, debug)).toEqual({
      ...initialState,
      archive: {
        ...oldArchive,
        '2016/2017': oldLessons,
      },
    });
  });
});

describe('import timetable', () => {
  const stateWithHidden = {
    ...initialState,
    hidden: {
      [1]: ['CS1101S', 'CS1231S'],
    },
  };

  test('should have hidden modules set when importing hidden', () => {
    expect(
      reducer(initialState, setHiddenImported(1, ['CS1101S', 'CS1231S'])).hidden,
    ).toMatchObject({
      [1]: ['CS1101S', 'CS1231S'],
    });

    // Should change hidden modules when a new set of modules is imported
    expect(
      reducer(stateWithHidden, setHiddenImported(1, ['CS2100', 'CS2103T'])).hidden,
    ).toMatchObject({
      [1]: ['CS2100', 'CS2103T'],
    });

    // should delete hidden modules when there are none
    expect(reducer(stateWithHidden, setHiddenImported(1, [])).hidden).toMatchObject({
      [1]: [],
    });
  });

  test('should copy over hidden modules when deciding to replace saved timetable', () => {
    expect(
      reducer(stateWithHidden, Internal.setTimetable(1, {}, {}, stateWithHidden.hidden[1])).hidden,
    ).toMatchObject({
      '1': ['CS1101S', 'CS1231S'],
    });
  });
});
