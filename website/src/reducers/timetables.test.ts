import { PersistConfig } from 'redux-persist/es/types';
import reducer, {
  defaultTimetableState,
  migrateV2toV3,
  nextSlotId,
  persistConfig,
} from 'reducers/timetables';
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
  addTimetableSlot,
  renameTimetableSlot,
} from 'actions/timetables';
import { TimetablesState } from 'types/reducers';
import config from 'config';
import { ModuleLessonConfig, TimetableConfig } from 'types/timetables';
import { LessonId, Semester } from 'types/modules';

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

describe('stateReconciler', () => {
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
    slots: {},
    activeSlot: {},
    academicYear: config.academicYear,
    archive: oldArchive,
  };

  const { stateReconciler } = persistConfig;
  if (!stateReconciler) {
    throw new Error('No stateReconciler');
  }

  const reconcilerPersistConfig = { debug: false } as PersistConfig<TimetablesState>;

  test('should return inbound state when academic year is the same', () => {
    expect(stateReconciler(inbound, initialState, initialState, reconcilerPersistConfig)).toEqual(
      inbound,
    );
  });

  test('should archive old timetables and clear state when academic year is different', () => {
    const oldInbound = {
      ...inbound,
      academicYear: '2016/2017',
    };

    expect(
      stateReconciler(oldInbound, initialState, initialState, reconcilerPersistConfig),
    ).toEqual({
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

describe(nextSlotId, () => {
  test('should return 0 for no slots', () => {
    expect(nextSlotId([])).toBe('0');
  });

  test('should return one more than the largest id, even past deletions', () => {
    const slot = (id: string) => ({ id, title: id, data: emptySlotData });
    expect(nextSlotId([slot('0')])).toBe('1');
    expect(nextSlotId([slot('0'), slot('2')])).toBe('3');
  });
});

describe(migrateV2toV3, () => {
  test('should add empty slot maps and leave everything else untouched', () => {
    const v2State = {
      ...initialState,
      lessons: { [1]: sem1Lessons },
      _persist: { version: 2, rehydrated: true },
    };

    expect(migrateV2toV3(v2State)).toEqual({
      ...v2State,
      slots: {},
      activeSlot: {},
    });
  });
});

const sem1Lessons = {
  CS1010S: {
    Lecture: ['1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13'],
  },
} satisfies TimetableConfig[Semester];

const emptySlotData = { lessons: {}, colors: {}, hidden: [], ta: [] };

// State as a user would have it before ever using slots: one timetable, no
// materialized slot entries
const preSlotState: TimetablesState = {
  ...initialState,
  lessons: { [1]: sem1Lessons },
  colors: { [1]: { CS1010S: 0 } },
  hidden: { [1]: ['CS1010S'] },
  ta: { [1]: [] },
};

const sem1SlotData = {
  lessons: sem1Lessons,
  colors: { CS1010S: 0 },
  hidden: ['CS1010S'],
  ta: [],
};

describe('timetable slot reducer', () => {
  describe('ADD_TIMETABLE_SLOT', () => {
    test('should materialize the implicit slot and activate a new blank slot', () => {
      const state = reducer(preSlotState, addTimetableSlot(1));

      expect(state.slots[1]).toHaveLength(2);
      expect(state.slots[1][0]).toEqual({ id: '0', title: 'Timetable 1', data: sem1SlotData });
      expect(state.slots[1][1]).toEqual({ id: '1', title: 'Timetable 2', data: emptySlotData });
      expect(state.activeSlot[1]).toBe('1');

      // Live maps now hold the new blank slot
      expect(state.lessons[1]).toEqual({});
      expect(state.colors[1]).toEqual({});
      expect(state.hidden[1]).toEqual([]);
      expect(state.ta[1]).toEqual([]);
    });

    test('should copy the current timetable when duplicating', () => {
      const state = reducer(preSlotState, addTimetableSlot(1, { duplicateCurrent: true }));

      expect(state.slots[1][1]).toEqual({ id: '1', title: 'Timetable 2', data: sem1SlotData });
      expect(state.activeSlot[1]).toBe('1');
      // Live maps keep the duplicated content
      expect(state.lessons[1]).toEqual(sem1Lessons);
    });

    test('should use the provided title', () => {
      const state = reducer(preSlotState, addTimetableSlot(1, { title: 'Backup plan' }));
      expect(state.slots[1][1].title).toBe('Backup plan');
    });

    test('should generate ids one past the largest existing id', () => {
      let state = reducer(preSlotState, addTimetableSlot(1)); // ids 0, 1 (active: 1)
      state = reducer(state, Internal.deleteTimetableSlot(1, '0')); // ids 1
      state = reducer(state, addTimetableSlot(1)); // new id is max(1) + 1 = 2

      expect(state.slots[1].map((slot) => slot.id)).toEqual(['1', '2']);
    });
  });

  describe('SWITCH_TIMETABLE_SLOT', () => {
    test('should save the outgoing slot and load the target slot', () => {
      // Active slot 1 is blank; slot 0 holds the original timetable
      const twoSlots = reducer(preSlotState, addTimetableSlot(1));
      const state = reducer(twoSlots, Internal.switchTimetableSlot(1, '0'));

      expect(state.activeSlot[1]).toBe('0');
      expect(state.lessons[1]).toEqual(sem1Lessons);
      expect(state.colors[1]).toEqual({ CS1010S: 0 });
      expect(state.hidden[1]).toEqual(['CS1010S']);

      // Outgoing slot 1's data was refreshed from the (blank) live maps
      expect(state.slots[1][1].data).toEqual(emptySlotData);
    });

    test('should preserve both timetables exactly across a round trip', () => {
      const otherLessons = {
        CS3216: {
          Lecture: ['1|MON|1830|2030|VCRm|1_2_3_4_5_6_7_8_9_10_11_12_13'],
        },
      } satisfies TimetableConfig[Semester];

      let state = reducer(preSlotState, addTimetableSlot(1));
      state = reducer(state, Internal.setTimetable(1, otherLessons, { CS3216: 1 }));
      state = reducer(state, Internal.switchTimetableSlot(1, '0'));

      expect(state.lessons[1]).toEqual(sem1Lessons);

      state = reducer(state, Internal.switchTimetableSlot(1, '1'));

      expect(state.lessons[1]).toEqual(otherLessons);
      expect(state.colors[1]).toEqual({ CS3216: 1 });
      expect(state.slots[1][0].data).toEqual(sem1SlotData);
    });

    test('should be a no-op when switching to the active slot', () => {
      const twoSlots = reducer(preSlotState, addTimetableSlot(1));
      expect(reducer(twoSlots, Internal.switchTimetableSlot(1, '1'))).toBe(twoSlots);
    });

    test('should be a no-op for an unknown slot', () => {
      const twoSlots = reducer(preSlotState, addTimetableSlot(1));
      expect(reducer(twoSlots, Internal.switchTimetableSlot(1, '99'))).toBe(twoSlots);
      expect(reducer(preSlotState, Internal.switchTimetableSlot(1, '99'))).toBe(preSlotState);
    });
  });

  describe('RENAME_TIMETABLE_SLOT', () => {
    test('should rename a slot', () => {
      const twoSlots = reducer(preSlotState, addTimetableSlot(1));
      const state = reducer(twoSlots, renameTimetableSlot(1, '0', 'Plan A'));
      expect(state.slots[1][0].title).toBe('Plan A');
    });

    test('should materialize and rename the implicit slot', () => {
      const state = reducer(preSlotState, renameTimetableSlot(1, '0', 'Plan A'));
      expect(state.slots[1]).toEqual([{ id: '0', title: 'Plan A', data: sem1SlotData }]);
      expect(state.activeSlot[1]).toBe('0');
    });

    test('should ignore blank titles and unknown slots', () => {
      const twoSlots = reducer(preSlotState, addTimetableSlot(1));
      expect(reducer(twoSlots, renameTimetableSlot(1, '0', '   '))).toBe(twoSlots);
      expect(reducer(twoSlots, renameTimetableSlot(1, '99', 'Plan A'))).toBe(twoSlots);
    });
  });

  describe('DELETE_TIMETABLE_SLOT', () => {
    test('should delete an inactive slot without touching the live timetable', () => {
      const twoSlots = reducer(preSlotState, addTimetableSlot(1, { duplicateCurrent: true }));
      const state = reducer(twoSlots, Internal.deleteTimetableSlot(1, '0'));

      expect(state.slots[1].map((slot) => slot.id)).toEqual(['1']);
      expect(state.activeSlot[1]).toBe('1');
      expect(state.lessons[1]).toEqual(sem1Lessons);
    });

    test('should activate the neighbouring slot when deleting the active slot', () => {
      // Slots: 0 (original), 1 (blank, active)
      const twoSlots = reducer(preSlotState, addTimetableSlot(1));
      const state = reducer(twoSlots, Internal.deleteTimetableSlot(1, '1'));

      expect(state.slots[1].map((slot) => slot.id)).toEqual(['0']);
      expect(state.activeSlot[1]).toBe('0');
      // Slot 0's timetable was loaded into the live maps
      expect(state.lessons[1]).toEqual(sem1Lessons);
      expect(state.colors[1]).toEqual({ CS1010S: 0 });
    });

    test('should be a no-op for the last remaining slot or unknown slots', () => {
      expect(reducer(preSlotState, Internal.deleteTimetableSlot(1, '0'))).toBe(preSlotState);

      const twoSlots = reducer(preSlotState, addTimetableSlot(1));
      expect(reducer(twoSlots, Internal.deleteTimetableSlot(1, '99'))).toBe(twoSlots);

      const oneSlot = reducer(twoSlots, Internal.deleteTimetableSlot(1, '1'));
      expect(reducer(oneSlot, Internal.deleteTimetableSlot(1, '0'))).toBe(oneSlot);
    });
  });

  describe('interaction with existing actions', () => {
    test('should not modify slots when the timetable is edited', () => {
      const twoSlots = reducer(preSlotState, addTimetableSlot(1, { duplicateCurrent: true }));
      const state = reducer(twoSlots, removeModule(1, 'CS1010S'));

      expect(state.slots).toBe(twoSlots.slots);
      expect(state.activeSlot).toBe(twoSlots.activeSlot);
    });

    test('should keep slots independent across semesters', () => {
      const state = reducer(preSlotState, addTimetableSlot(2));

      expect(state.slots[2]).toHaveLength(2);
      expect(state.slots[1]).toBeUndefined();
      expect(state.lessons[1]).toEqual(sem1Lessons);
    });
  });
});
